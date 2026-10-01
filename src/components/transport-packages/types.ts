export type TransportMode = "day" | "round";
export type TransportCatalog = {version:string;exchangeRate:number;vehicles:Array<{id:string;name:string;category:string;description:string;image:string;imageNote:string;dayLkr:number;roundDayLkr:number}>};
