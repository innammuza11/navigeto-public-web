import { natureThemes, type NatureTheme, type NatureSurface } from "./nature-theme";

// Original procedural scenes. Ray/geometry intersections, volumetric clouds,
// water normals and atmospheric scattering run on the GPU; no image/video
// downloads, model trackers, third-party runtime, or changes to page content.
const vertexSource = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `#version 300 es
precision highp float;
#define SCENE __SCENE__
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float journey;
uniform float scrollProgress;
out vec4 fragColor;
const vec3 SUN = vec3(0.52, 0.43, -0.735);
float hash(vec3 p) {
  p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  float n = 0.0, a = 0.5;
  for (int i=0;i<4;i++) { n += a*noise(p); p = p*2.03+vec3(2.1,5.4,1.7); a *= 0.5; }
  return n;
}
vec3 atmosphere(vec3 rd) {
  float elevation = max(rd.y, 0.0);
  vec3 sky = mix(vec3(0.77,0.88,0.95),vec3(0.11,0.46,0.76),pow(elevation,0.45));
  float sun = max(dot(rd,SUN),0.0);
  sky += vec3(1.0,0.75,0.43)*pow(sun,12.0)*0.22;
  sky += vec3(1.0,0.90,0.70)*pow(sun,650.0)*1.8;
  return sky;
}
float cloudDensity(vec3 p) {
  float envelope = smoothstep(2.6,3.5,p.y)*(1.0-smoothstep(4.7,6.8,p.y));
  p.x += time*0.035;
  return max(0.0,fbm(p*0.62)-0.43)*envelope*2.4;
}
vec3 clouds(vec3 ro,vec3 rd,vec3 sky) {
  if (abs(rd.y) < 0.015) return sky;
  float a=(2.6-ro.y)/rd.y,b=(6.8-ro.y)/rd.y;
  float start = max(0.0,min(a,b));
  float end = min(max(a,b),45.0);
  if(end<=start) return sky;
  float stepSize = max(0.0,end-start)/22.0;
  vec4 sum = vec4(0.0);
  for(int i=0;i<22;i++) {
    vec3 p = ro+rd*(start+(float(i)+0.45)*stepSize);
    float d = cloudDensity(p);
    if(d>0.006) {
      float shade = clamp((d-cloudDensity(p+SUN*0.6))*2.5+0.55,0.0,1.0);
      vec3 light = mix(vec3(0.45,0.57,0.68),vec3(1.0,0.98,0.91),shade);
      float alpha = 1.0-exp(-d*stepSize*1.9);
      sum.rgb += (1.0-sum.a)*light*alpha;
      sum.a += (1.0-sum.a)*alpha;
      if(sum.a>0.98) break;
    }
  }
  return sky*(1.0-sum.a)+sum.rgb;
}
float terrain(vec2 p) {
  float base = fbm(vec3(p*0.075,3.0));
  float ridge = 1.0-abs(2.0*noise(vec3(p*0.055,1.0))-1.0);
  return base*5.0+ridge*3.2-3.6;
}
float wave(vec2 p) {
  return sin(p.x*0.9+p.y*1.25-time*0.7)*0.038
       + sin(p.x*2.7-p.y*1.8+time*0.95)*0.022
       + sin(p.x*6.4+p.y*4.3-time*1.1)*0.009
       + noise(vec3(p*7.0,time*0.2))*0.018;
}
vec3 ocean(vec3 ro,vec3 rd) {
  vec3 sky=clouds(ro,rd,atmosphere(rd));
  if(rd.y>=-0.006) return sky;
  float t=-ro.y/rd.y;
  for(int i=0;i<4;i++) t=(wave((ro+rd*t).xz)-ro.y)/rd.y;
  vec3 p=ro+rd*t;
  float eps=0.025;
  vec3 normal=normalize(vec3(wave(p.xz-vec2(eps,0))-wave(p.xz+vec2(eps,0)),2.0*eps,
                            wave(p.xz-vec2(0,eps))-wave(p.xz+vec2(0,eps))));
  vec3 reflected=reflect(rd,normal);
  float fresnel=0.03+0.97*pow(1.0-max(dot(-rd,normal),0.0),5.0);
  vec3 sand=vec3(0.77,0.72,0.52);
  float depth=smoothstep(1.2,17.0,t);
  vec3 water=mix(sand,vec3(0.018,0.36,0.42),depth);
  float caustic=pow(max(0.0,sin(p.x*3.0+sin(p.z*3.4+time*0.5))*sin(p.z*4.2-time*0.4)),6.0);
  water+=vec3(0.27,0.32,0.18)*caustic*(1.0-depth);
  water=mix(water,atmosphere(reflected),fresnel);
  water+=vec3(1.0,0.91,0.69)*pow(max(dot(reflected,SUN),0.0),150.0)*1.5;
  float foam=1.0-smoothstep(0.0,0.10,abs(sin(p.z*0.8+time*0.38)+p.x*0.05));
  water=mix(water,vec3(0.90,0.96,0.94),foam*(1.0-depth)*0.3);
  return mix(water,atmosphere(rd),1.0-exp(-t*0.009));
}
float tree(vec3 p,vec2 cell) {
  float seed=hash(vec3(cell,19.0));
  vec2 center=(cell+0.5)*3.5+vec2(seed-0.5,hash(vec3(cell,2.0))-0.5)*1.7;
  float ground=0.0;
  vec3 q=p-vec3(center.x,ground,center.y);
  float height=2.3+seed*3.1;
  q.x+=sin(time*0.42+cell.x)*0.025*max(q.y,0.0);
  float trunk=max(length(q.xz)-0.11,abs(q.y-height*0.4)-height*0.4);
  vec3 canopy=q-vec3(0,height*0.75,0);
  float crown=(length(canopy/vec3(1.15,height*0.4,1.1))-1.0)*0.75;
  return min(trunk,crown);
}
vec2 forestDistance(vec3 p) {
  float ground=p.y;
  vec2 cell=floor(p.xz/3.5-0.5);
  float trees=100.0;
  for(int x=0;x<=1;x++) for(int z=0;z<=1;z++) {
    trees=min(trees,tree(p,cell+vec2(float(x),float(z))));
  }
  return ground<trees?vec2(ground,0.0):vec2(trees,1.0);
}
float landDistance(vec3 p) {
#if SCENE == 4
  return forestDistance(p).x;
#else
  return (p.y-terrain(p.xz))*0.55;
#endif
}
vec3 landscape(vec3 ro,vec3 rd) {
  vec3 sky=clouds(ro,rd,atmosphere(rd));
  float t=0.1;
  bool hit=false;
  for(int i=0;i<68;i++) {
    float d=landDistance(ro+rd*t);
    if(d<0.035+0.001*t) {hit=true;break;}
    t+=max(d,0.045);
    if(t>85.0) break;
  }
  if(!hit) return sky;
  vec3 p=ro+rd*t;
  vec2 e=vec2(0.055,0.0);
  vec3 n=normalize(vec3(landDistance(p+e.xyy)-landDistance(p-e.xyy),
                        landDistance(p+e.yxy)-landDistance(p-e.yxy),
                        landDistance(p+e.yyx)-landDistance(p-e.yyx)));
  float detail=fbm(p*3.0);
  vec3 base=mix(vec3(0.12,0.23,0.11),vec3(0.35,0.44,0.21),detail);
#if SCENE == 4
  if(forestDistance(p).y>0.5) base=mix(vec3(0.055,0.16,0.085),vec3(0.22,0.36,0.10),detail);
#else
  base=mix(vec3(0.28,0.31,0.28),base,smoothstep(0.4,0.8,n.y));
#endif
  float diffuse=max(dot(n,SUN),0.0);
  vec3 color=base*(vec3(0.42,0.54,0.68)+vec3(1.0,0.85,0.65)*diffuse*1.2);
  float haze=1.0-exp(-t*0.032);
  color=mix(color,vec3(0.68,0.82,0.85),haze);
  float mist=exp(-max(p.y,0.0)*0.45)*smoothstep(5.0,60.0,t)*0.4;
  mist*=0.45+0.55*noise(p*0.35+vec3(time*0.045,0.0,0.0));
  color=mix(color,vec3(0.84,0.90,0.88),mist);
  return color;
}
vec3 universe(vec3 ro,vec3 rd) {
  float nebula=fbm(rd*4.0+vec3(0.0,time*0.002,0.0));
  vec3 color=mix(vec3(0.009,0.019,0.057),vec3(0.11,0.095,0.25),pow(nebula,3.0));
  vec3 starCell=floor(rd*520.0);
  float star=pow(hash(starCell),180.0);
  color+=vec3(0.65,0.82,1.0)*star*0.8;
  vec3 center=vec3(3.0,1.1,-7.0), oc=ro-center;
  float b=dot(oc,rd), c=dot(oc,oc)-7.84, h=b*b-c;
  if(h>0.0 && -b-sqrt(h)>0.0) {
    vec3 p=ro+rd*(-b-sqrt(h));
    vec3 n=normalize(p-center);
    float spin=time*0.017;
    vec3 q=vec3(cos(spin)*n.x+sin(spin)*n.z,n.y,-sin(spin)*n.x+cos(spin)*n.z);
    float continental=fbm(q*4.1);
    float land=smoothstep(0.46,0.51,continental);
    vec3 albedo=mix(vec3(0.015,0.16,0.32),vec3(0.15,0.32,0.17),land);
    float cloud=smoothstep(0.48,0.68,fbm(q*8.0+vec3(time*0.009,0,0)));
    albedo=mix(albedo,vec3(0.92,0.96,1.0),cloud);
    float light=max(dot(n,normalize(vec3(-0.6,0.6,0.5))),0.0);
    color=albedo*(0.045+light*1.25);
    color+=vec3(0.12,0.37,0.80)*pow(1.0-max(dot(n,-rd),0.0),3.5)*(light+0.18);
  } else {
    float limb=abs(length(cross(center-ro,rd))-2.8);
    color+=vec3(0.05,0.19,0.42)*exp(-limb*19.0)*smoothstep(0.0,1.0,dot(rd,normalize(center-ro)));
  }
  return color;
}
float ellipsoidHit(vec3 ro,vec3 rd,vec3 scale) {
  vec3 o=ro/scale,d=rd/scale;
  float a=dot(d,d),b=dot(o,d),c=dot(o,o)-1.0,h=b*b-a*c;
  return h>0.0?(-b-sqrt(h))/a:1e5;
}
// Sky Journey: a cloud bank below the camera, high cirrus and a lit aircraft.
float journeyDensity(vec3 p) {
  p.xz += vec2(time*0.045, time*0.025);
  float mass = noise(vec3(p.xz*0.19, 7.0));
  float top = -0.6 + mass*4.4;
  float envelope = smoothstep(-2.2,-1.3,p.y)*(1.0-smoothstep(top-0.8,top+0.3,p.y));
  float billow = fbm(p*0.73);
  return max(billow-0.32,0.0)*envelope*2.8;
}
vec3 journeyClouds(vec3 ro, vec3 rd) {
  vec3 sky=atmosphere(rd);
  // Thin high cloud catches the warm sun without another volume march.
  if(rd.y>0.02) {
    vec2 high=rd.xz/rd.y;
    float cirrus=pow(noise(vec3(high*vec2(0.36,1.4)+time*0.008,12.0)),5.0);
    sky=mix(sky,vec3(0.94,0.97,1.0),cirrus*0.34);
  }
  float start=0.0, end=0.0;
  if(rd.y < -0.012) {
    start=max(0.0,(3.2-ro.y)/rd.y);
    end=min(65.0,(-2.2-ro.y)/rd.y);
  }
  vec4 sum=vec4(0.0);
  float stepSize=max(end-start,0.0)/24.0;
  if(stepSize>0.0) for(int i=0;i<24;i++) {
    vec3 p=ro+rd*(start+(float(i)+0.5)*stepSize);
    float d=journeyDensity(p);
    if(d>0.012) {
      float shadow=exp(-journeyDensity(p+SUN*0.75)*2.0);
      float rim=pow(max(dot(rd,SUN),0.0),9.0);
      vec3 light=mix(vec3(0.38,0.55,0.71),vec3(1.0,0.98,0.91),shadow);
      light+=vec3(1.0,0.80,0.52)*rim*0.24*shadow;
      light=mix(light,vec3(0.72,0.85,0.96),1.0-exp(-length(p-ro)*0.014));
      float alpha=1.0-exp(-d*stepSize*1.8);
      sum.rgb+=(1.0-sum.a)*light*alpha;
      sum.a+=(1.0-sum.a)*alpha;
      if(sum.a>0.985) break;
    }
  }
  return sky*(1.0-sum.a)+sum.rgb;
}
void aircraftPart(vec3 ro,vec3 rd,vec3 offset,vec3 scale,vec3 paint,inout float nearest,inout vec3 color) {
  vec3 origin=ro-offset;
  float t=ellipsoidHit(origin,rd,scale);
  if(t>0.0 && t<nearest) {
    nearest=t;
    vec3 normal=normalize((origin+rd*t)/(scale*scale));
    float diffuse=max(dot(normal,normalize(vec3(-0.4,0.8,0.6))),0.0);
    float specular=pow(max(dot(reflect(rd,normal),normalize(vec3(-0.4,0.8,0.6))),0.0),36.0);
    color=paint*(0.52+0.48*diffuse)+vec3(1.0,0.91,0.75)*specular*0.45;
  }
}
vec3 skyJourney(vec3 ro,vec3 rd) {
  vec3 color=journeyClouds(ro,rd);
  // A slow bank and forward drift, with no abrupt loop reset.
  vec3 center=ro+vec3(3.2+sin(time*0.045)*1.0,0.4+sin(time*0.07)*0.12,-9.5);
  vec3 q=ro-center, ray=rd;
  float bank=0.13+sin(time*0.11)*0.055;
  mat2 roll=mat2(cos(bank),-sin(bank),sin(bank),cos(bank));
  q.xy=roll*q.xy; ray.xy=roll*ray.xy;
  float yaw=-0.68;
  mat2 turn=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw));
  q.xz=turn*q.xz; ray.xz=turn*ray.xz;
  float nearest=1e5;
  vec3 aircraft=vec3(0.0),silver=vec3(0.89,0.94,0.98),blue=vec3(0.035,0.27,0.48);
  aircraftPart(q,ray,vec3(0),vec3(0.10,0.105,0.82),silver,nearest,aircraft);
  // Swept main wings, tailplanes, vertical stabilizer and two engines.
  for(int side=-1;side<=1;side+=2) {
    float sidef=float(side);
    vec3 wing=q; wing.z-=abs(wing.x)*0.38;
    vec3 wingRay=ray; wingRay.z-=sidef*wingRay.x*0.38;
    aircraftPart(wing,wingRay,vec3(sidef*0.43,-0.015,0.08),vec3(0.48,0.025,0.20),silver,nearest,aircraft);
    aircraftPart(q,ray,vec3(sidef*0.23,0.035,0.61),vec3(0.25,0.025,0.13),silver,nearest,aircraft);
    aircraftPart(q,ray,vec3(sidef*0.30,-0.12,-0.04),vec3(0.065,0.075,0.20),blue,nearest,aircraft);
  }
  aircraftPart(q,ray,vec3(0,0.18,0.59),vec3(0.028,0.24,0.17),blue,nearest,aircraft);
  aircraftPart(q,ray,vec3(0,0.071,-0.55),vec3(0.074,0.046,0.16),blue,nearest,aircraft);
  if(nearest<100.0) color=mix(aircraft,atmosphere(rd),0.12);
  // Atmospheric horizon glow ties the aircraft and cloud bank together.
  color+=vec3(0.20,0.28,0.33)*exp(-abs(rd.y+0.015)*22.0)*0.12;
  return color;
}
vec3 birds(vec3 ro,vec3 rd,vec3 color) {
  for(int i=0;i<5;i++) {
    float fi=float(i);
    vec3 center=vec3(9.0+sin(time*0.09+fi*0.42)*8.0,8.0+fi*0.45,-9.0-fi*4.0);
    vec3 q=ro-center;
    float hit=ellipsoidHit(q,rd,vec3(0.09,0.09,0.32));
    float flap=sin(time*2.8-fi*0.55)*0.45;
    for(int side=-1;side<=1;side+=2) {
      float s=float(side),a=flap*s;
      mat2 rotation=mat2(cos(a),-sin(a),sin(a),cos(a));
      vec3 wing=q,ray=rd;
      wing.xy=rotation*wing.xy; ray.xy=rotation*ray.xy;
      wing.x-=s*0.32;
      hit=min(hit,ellipsoidHit(wing,ray,vec3(0.36,0.035,0.12)));
    }
    if(hit>0.0 && hit<100.0) color=mix(vec3(0.065,0.105,0.11),atmosphere(rd),1.0-exp(-hit*0.018));
  }
  return color;
}
void main() {
  vec2 uv=(gl_FragCoord.xy*2.0-resolution)/resolution.y;
  vec3 ro=vec3(0.0,1.1,5.0);
  vec3 rd=normalize(vec3(uv.x+pointer.x*0.055,uv.y*0.85+0.13+pointer.y*0.025,-1.65));
  vec3 color;
#if SCENE == 0
  if(journey>0.5) {
    ro=vec3(pointer.x*0.12,4.2,5.0-time*0.06);
    rd=normalize(vec3(uv.x+pointer.x*0.065,uv.y*0.82+0.08-scrollProgress*0.12+pointer.y*0.04,-1.65));
    color=skyJourney(ro,rd);
  } else color=clouds(ro,rd,atmosphere(rd));
#elif SCENE == 1
  color=universe(ro,rd);
#elif SCENE == 2
  rd=normalize(vec3(uv.x+pointer.x*0.05,uv.y*0.72-0.20+pointer.y*0.025,-1.65));
  color=ocean(ro,rd);
#else
  ro=vec3(7.0,7.7,13.0);
  rd=normalize(vec3(uv.x+pointer.x*0.05,uv.y*0.72-0.30+pointer.y*0.025,-1.65));
  color=landscape(ro,rd);
#if SCENE == 4
  color=birds(ro,rd,color);
#endif
#endif
  color=clamp(color,0.0,1.0);
  color=pow(color,vec3(0.93));
  fragColor=vec4(color,1.0);
}
`;

export function mountNatureRenderer(
  canvas: HTMLCanvasElement,
  theme: NatureTheme,
  surface: NatureSurface,
  onReady: (ready: boolean) => void,
  hero?: HTMLElement,
): () => void {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return () => {};
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  const shaders: WebGLShader[] = [];
  let frame = 0;
  let disposed = false;
  let lost = false;
  let visible = true;
  let lastFrame = 0;
  let elapsed = 0;
  let quality = 1;
  let slowFrames = 0;
  let targetX = 0, targetY = 0, x = 0, y = 0;
  let scrollTarget = 0, scroll = 0;
  const journey = Boolean(hero && theme === "sky" && surface === "public");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const frameInterval = surface === "admin" || mobile ? 1000 / 20 : 1000 / 30;
  const pixelBudget = mobile ? 180_000 : surface === "admin" ? 300_000 : journey ? 480_000 : 650_000;
  let uResolution: WebGLUniformLocation | null = null;
  let uTime: WebGLUniformLocation | null = null;
  let uPointer: WebGLUniformLocation | null = null;
  let uJourney: WebGLUniformLocation | null = null;
  let uScroll: WebGLUniformLocation | null = null;

  function release() {
    if (buffer) gl!.deleteBuffer(buffer);
    if (program) gl!.deleteProgram(program);
    shaders.forEach((shader) => gl!.deleteShader(shader));
    shaders.length = 0;
    program = null; buffer = null;
  }
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Nature shader allocation failed");
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("Nature shader compilation failed");
    return shader;
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width), height = Math.max(1, bounds.height);
    const scale = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(pixelBudget * quality / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    if (reduced.matches && program && !lost) draw();
  }
  function draw() {
    if (!program || lost || disposed) return;
    x += (targetX - x) * 0.065; y += (targetY - y) * 0.065;
    scroll += (scrollTarget - scroll) * 0.065;
    gl!.uniform2f(uResolution, canvas.width, canvas.height);
    gl!.uniform1f(uTime, reduced.matches ? 0 : elapsed);
    gl!.uniform1f(uJourney, journey ? 1 : 0);
    gl!.uniform1f(uScroll, reduced.matches ? 0 : scroll);
    gl!.uniform2f(uPointer, reduced.matches ? 0 : x, reduced.matches ? 0 : y);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  function tick(now: number) {
    frame = 0;
    if (!program || disposed || lost || document.hidden || !visible || reduced.matches) return;
    const delta = now - lastFrame;
    if (delta >= frameInterval) {
      elapsed += Math.min(delta, 100) / 1000;
      if (lastFrame > 0 && delta > frameInterval * 2.8) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 18 && quality > 0.35) { quality *= 0.7; slowFrames = 0; resize(); }
      lastFrame = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
    if (!program || disposed || lost || document.hidden || !visible) return;
    draw();
    if (!reduced.matches) frame = requestAnimationFrame(tick);
  }
  function initialize() {
    try {
      program = gl!.createProgram();
      if (!program) throw new Error("Nature program allocation failed");
      gl!.attachShader(program, compile(gl!.VERTEX_SHADER, vertexSource));
      gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, fragmentSource.replace("__SCENE__", String(natureThemes.indexOf(theme)))));
      gl!.linkProgram(program);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) throw new Error("Nature shader linking failed");
      gl!.useProgram(program);
      buffer = gl!.createBuffer();
      if (!buffer) throw new Error("Nature buffer allocation failed");
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl!.STATIC_DRAW);
      const position = gl!.getAttribLocation(program, "position");
      gl!.enableVertexAttribArray(position);
      gl!.vertexAttribPointer(position, 2, gl!.FLOAT, false, 0, 0);
      uResolution = gl!.getUniformLocation(program, "resolution");
      uTime = gl!.getUniformLocation(program, "time");
      uPointer = gl!.getUniformLocation(program, "pointer");
      uJourney = gl!.getUniformLocation(program, "journey");
      uScroll = gl!.getUniformLocation(program, "scrollProgress");
      resize(); draw(); onReady(true); resume();
    } catch {
      release(); onReady(false);
    }
  }
  function pointerMove(event: PointerEvent) {
    if (event.pointerType !== "mouse" || reduced.matches || !visible) return;
    targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    targetY = (0.5 - event.clientY / Math.max(window.innerHeight, 1)) * 2;
  }
  function updateScroll() {
    if (!hero || reduced.matches) return;
    const bounds = hero.getBoundingClientRect();
    scrollTarget = Math.max(0, Math.min(1, -bounds.top / Math.max(bounds.height, 1)));
  }
  function contextLost(event: Event) { event.preventDefault(); lost = true; cancelAnimationFrame(frame); onReady(false); }
  function contextRestored() { if (!disposed) { lost = false; release(); initialize(); } }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
  observer.observe(hero ?? canvas);
  if (hero) { window.addEventListener("scroll", updateScroll, { passive: true }); updateScroll(); }
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("pointermove", pointerMove, { passive: true });
  reduced.addEventListener("change", resume);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  initialize();
  return () => {
    disposed = true; cancelAnimationFrame(frame);
    observer.disconnect(); sizeObserver.disconnect();
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("pointermove", pointerMove);
    window.removeEventListener("scroll", updateScroll);
    reduced.removeEventListener("change", resume);
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", contextRestored);
    release(); onReady(false);
  };
}
