/** Photographic depth and atmosphere. This is an image-based scene, not a terrain map. */
const vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0,1);}`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D landscape;
uniform vec2 resolution;
uniform vec2 photographSize;
uniform vec2 camera;
uniform float time;
uniform float progress;
out vec4 color;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 screen=gl_FragCoord.xy/resolution;
 vec2 uv=vec2(screen.x,1.-screen.y);
 float aspect=resolution.x/resolution.y,photoAspect=photographSize.x/photographSize.y;
 vec2 cover=vec2(min(aspect/photoAspect,1.),min(photoAspect/aspect,1.));
 // Foreground moves further than distant ridges; the margin prevents exposed edges.
 float depth=smoothstep(.12,.95,uv.y);
 vec2 offset=camera*vec2(.008,-.005)*(0.3+depth);
 uv=(uv-.5)*cover*(.95-progress*.035)+.5+offset;
 uv.y-=progress*.017;
 uv+=vec2(sin(time*.045)*.002,cos(time*.038)*.001);
 vec3 scene=texture(landscape,clamp(uv,vec2(.001),vec2(.999))).rgb;
 vec2 mistUv=screen*vec2(4.5,3.)+vec2(time*.018,-time*.004);
 float mist=noise(mistUv)*.6+noise(mistUv*2.1)*.3+noise(mistUv*4.)*.1;
 float bank=smoothstep(.43,.76,mist)*exp(-pow((screen.y-.47)/.27,2.));
 // Cool translucent mist retains the detail and photographic lighting underneath.
 scene=mix(scene,vec3(.78,.87,.90),bank*.22);
 color=vec4(scene,1.);
}`;
export function mountLandscapeScene(canvas: HTMLCanvasElement, root: HTMLElement, ready: (value: boolean) => void): () => void {
  const hero = root.querySelector<HTMLElement>(".cinematic-hero");
  const gl = canvas.getContext("webgl2", { alpha:false, antialias:false, depth:false, powerPreference:"low-power" });
  if (!gl || !hero) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const photo = new Image();
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null, texture: WebGLTexture | null = null;
  let shaders: WebGLShader[] = [];
  let disposed=false,lost=false,visible=true,frame=0,last=0,time=0,quality=1,slow=0;
  let tx=0,ty=0,x=0,y=0,progress=0,targetProgress=0;
  let uResolution:WebGLUniformLocation|null=null,uSize:WebGLUniformLocation|null=null,uCamera:WebGLUniformLocation|null=null,uTime:WebGLUniformLocation|null=null,uProgress:WebGLUniformLocation|null=null;
  function release(){if(texture)gl!.deleteTexture(texture);if(buffer)gl!.deleteBuffer(buffer);if(program)gl!.deleteProgram(program);shaders.forEach(s=>gl!.deleteShader(s));shaders=[];program=null;buffer=null;texture=null;}
  function draw(){
    if(!program||disposed||lost)return;
    x+=(tx-x)*.065;y+=(ty-y)*.065;progress+=(targetProgress-progress)*.08;
    gl!.uniform2f(uResolution,canvas.width,canvas.height);
    gl!.uniform2f(uSize,photo.naturalWidth,photo.naturalHeight);
    gl!.uniform2f(uCamera,reduced.matches?0:x,reduced.matches?0:y);
    gl!.uniform1f(uTime,reduced.matches?0:time);gl!.uniform1f(uProgress,reduced.matches?0:progress);
    gl!.drawArrays(gl!.TRIANGLES,0,3);
  }
  function resize(){
    const heroBounds=hero!.getBoundingClientRect(),rootBounds=root.getBoundingClientRect();
    root.style.setProperty("--cinematic-top",`${heroBounds.top-rootBounds.top}px`);
    root.style.setProperty("--cinematic-height",`${heroBounds.height}px`);
    const b=canvas.getBoundingClientRect();
    const budget=window.innerWidth<768?350000:1100000;
    const scale=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(budget*quality/Math.max(1,b.width*b.height)));
    canvas.width=Math.max(1,Math.round(b.width*scale));canvas.height=Math.max(1,Math.round(b.height*scale));
    gl!.viewport(0,0,canvas.width,canvas.height);draw();
  }
  function tick(now:number){
    frame=0;if(disposed||lost||!visible||document.hidden||reduced.matches||!program)return;
    const delta=now-last;
    if(delta>=1000/30){
      time+=Math.min(delta,100)/1000;
      slow=last>0&&delta>90?slow+1:Math.max(0,slow-1);
      if(slow>20&&quality>.4){quality*=.75;slow=0;resize();}
      last=now;draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(!visible||document.hidden||disposed||lost)return;draw();if(!reduced.matches&&program)frame=requestAnimationFrame(tick);}
  function compile(kind:number,source:string){const shader=gl!.createShader(kind);if(!shader)throw Error("allocation");shaders.push(shader);gl!.shaderSource(shader,source);gl!.compileShader(shader);if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS))throw Error("shader");return shader;}
  function initialize(){
    if(disposed||lost||!photo.complete||!photo.naturalWidth)return;
    try{
      program=gl!.createProgram();if(!program)throw Error("program");
      gl!.attachShader(program,compile(gl!.VERTEX_SHADER,vertex));gl!.attachShader(program,compile(gl!.FRAGMENT_SHADER,fragment));gl!.linkProgram(program);
      if(!gl!.getProgramParameter(program,gl!.LINK_STATUS))throw Error("link");gl!.useProgram(program);
      buffer=gl!.createBuffer();texture=gl!.createTexture();if(!buffer||!texture)throw Error("resources");
      gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);gl!.bufferData(gl!.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl!.STATIC_DRAW);
      const attr=gl!.getAttribLocation(program,"position");gl!.enableVertexAttribArray(attr);gl!.vertexAttribPointer(attr,2,gl!.FLOAT,false,0,0);
      gl!.activeTexture(gl!.TEXTURE0);gl!.bindTexture(gl!.TEXTURE_2D,texture);
      gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MIN_FILTER,gl!.LINEAR);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MAG_FILTER,gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_S,gl!.CLAMP_TO_EDGE);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_T,gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,gl!.RGBA,gl!.UNSIGNED_BYTE,photo);gl!.uniform1i(gl!.getUniformLocation(program,"landscape"),0);
      uResolution=gl!.getUniformLocation(program,"resolution");uSize=gl!.getUniformLocation(program,"photographSize");uCamera=gl!.getUniformLocation(program,"camera");uTime=gl!.getUniformLocation(program,"time");uProgress=gl!.getUniformLocation(program,"progress");
      resize();ready(true);resume();
    }catch{release();ready(false);}
  }
  function pointer(e:PointerEvent){if(e.pointerType!=="mouse"||reduced.matches||!visible)return;tx=(e.clientX/window.innerWidth-.5)*2;ty=(e.clientY/window.innerHeight-.5)*2;}
  function scroll(){const b=hero!.getBoundingClientRect();targetProgress=Math.max(0,Math.min(1,-b.top/Math.max(1,b.height)));}
  function contextLost(e:Event){e.preventDefault();lost=true;cancelAnimationFrame(frame);ready(false);}
  function restore(){if(disposed)return;lost=false;release();initialize();}
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();});intersection.observe(hero);
  const size=new ResizeObserver(resize);size.observe(canvas);size.observe(hero);
  window.addEventListener("pointermove",pointer,{passive:true});window.addEventListener("scroll",scroll,{passive:true});document.addEventListener("visibilitychange",resume);reduced.addEventListener("change",resume);
  canvas.addEventListener("webglcontextlost",contextLost);canvas.addEventListener("webglcontextrestored",restore);
  photo.onload=initialize;photo.onerror=()=>ready(false);photo.src="/media/ella-hero-cinematic-v2.webp";scroll();
  return()=>{disposed=true;cancelAnimationFrame(frame);photo.onload=null;photo.onerror=null;intersection.disconnect();size.disconnect();window.removeEventListener("pointermove",pointer);window.removeEventListener("scroll",scroll);document.removeEventListener("visibilitychange",resume);reduced.removeEventListener("change",resume);canvas.removeEventListener("webglcontextlost",contextLost);canvas.removeEventListener("webglcontextrestored",restore);release();root.style.removeProperty("--cinematic-top");root.style.removeProperty("--cinematic-height");ready(false);};
}
