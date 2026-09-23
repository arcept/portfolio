'use client';

import ShaderGlyph from './ShaderGlyph';

// "Make it clear. Let it meet reality.": a cube of glass with very soft edges, turning slowly about
// a diagonal axis. Ray-marched like the orb and the keys (see OrbGlyph.js), plus refraction: the ray
// is bent as it enters the glass, followed to where it leaves (bouncing inside when it cannot),
// and bent again on the way out — once per colour channel, each with its own index of refraction,
// which is what splits the light into rainbow fringes. What it sees through the glass is a small
// studio (bands of light, a dark stripe, two hot spots) that follows the page's theme.

const FS = `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 resolution;uniform float time,lightTheme,since;
const float PI=3.14159265;
// Sized so the cube's widest turn (corner towards the viewer) nearly fills its slot, as the orb does.
const float FOCAL=2.9;
mat3 M;
mat3 rotAxis(vec3 a,float g){float c=cos(g),s=sin(g),o=1.-c;
 return mat3(vec3(o*a.x*a.x+c,o*a.x*a.y+s*a.z,o*a.x*a.z-s*a.y),vec3(o*a.x*a.y-s*a.z,o*a.y*a.y+c,o*a.y*a.z+s*a.x),vec3(o*a.x*a.z+s*a.y,o*a.y*a.z-s*a.x,o*a.z*a.z+c));}
float box3(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdf(vec3 p){return box3(M*p,vec3(.27),.25);}
vec3 norm(vec3 p){vec2 e=vec2(.004,0.);return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx)));}
vec3 env(vec3 d){
 vec3 top=mix(vec3(.72,.64,1.),vec3(.90,.87,1.),lightTheme);
 vec3 bot=mix(vec3(.07,.05,.15),vec3(.46,.42,.66),lightTheme);
 vec3 col=mix(bot,top,smoothstep(-.6,.8,d.y));
 col+=vec3(2.4,2.5,2.9)*exp(-pow((d.y-.35)*4.,2.))*(.55+.45*cos(d.x*3.));
 col+=vec3(1.5,1.6,2.0)*exp(-pow((d.x+.55)*3.6,2.))*smoothstep(-.6,.3,d.y);
 col*=1.-.6*exp(-pow((d.y+.28)*4.5,2.));
 vec3 l1=normalize(vec3(-.5,.75,.6));vec3 l2=normalize(vec3(.6,.1,.7));
 col+=vec3(6.)*exp(-pow(acos(clamp(dot(d,l1),-1.,1.)),2.)/.03);
 col+=vec3(3.5,3.6,4.)*exp(-pow(acos(clamp(dot(d,l2),-1.,1.)),2.)/.05);
 return col;}
// Follows a ray into the glass and out again; returns where it leaves and how far it travelled inside.
vec3 through(vec3 p,vec3 n,vec3 rd,float ior,out float len){
 vec3 r=refract(rd,n,1./ior);if(dot(r,r)<.001)r=reflect(rd,n);
 vec3 pp=p-n*.004;len=0.;
 for(int b=0;b<2;b++){
  float t=.01;for(int i=0;i<32;i++){float d=-sdf(pp+r*t);if(d<.002)break;t+=d;if(t>3.)break;}
  pp+=r*t;len+=t;
  vec3 nn=norm(pp);
  vec3 ex=refract(r,-nn,ior);
  if(dot(ex,ex)>.001)return ex;
  r=reflect(r,nn);pp-=nn*.004;
 }
 return r;}
// Frosted: the studio seen through the glass is averaged over a small cone around the exit direction.
vec3 frosted(vec3 d,float k){
 vec3 u=normalize(cross(d,vec3(0.,1.,.3)));vec3 v=cross(d,u);
 vec3 c=env(d)*.28;
 for(int i=0;i<6;i++){float a=float(i)*1.0472+.4;c+=env(normalize(d+(cos(a)*u+sin(a)*v)*k))*.12;}
 return c;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec4 render(vec2 coord){
 vec2 st=(coord-.5*resolution)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,.25,4.8);vec3 target=vec3(0.);
 vec3 ww=normalize(target-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(st.x*uu+st.y*vv+FOCAL*ww);
 float b=dot(ro,rd);float h=b*b-(dot(ro,ro)-1.2);
 if(h<0.)return vec4(0.);
 h=sqrt(h);float t=max(-b-h,0.),tmax=-b+h;
 float md=1e9,mt=t;bool hit=false;
 for(int i=0;i<100;i++){float d=sdf(ro+rd*t);if(d<.0006){hit=true;break;}if(d<md){md=d;mt=t;}t+=d*.9;if(t>tmax)break;}
 float cov=1.;vec3 p;
 if(hit){p=ro+rd*t;}
 else{
  float w=mt/(FOCAL*min(resolution.x,resolution.y));
  cov=clamp(1.-md/(w*2.6),0.,1.);
  if(cov<=0.)return vec4(0.);
  p=ro+rd*mt;
 }
 vec3 n=norm(p);
 // Slightly different index for each channel: the dispersion.
 float l0,l1,l2;
 vec3 dr=through(p,n,rd,1.40,l0),dg=through(p,n,rd,1.50,l1),db=through(p,n,rd,1.62,l2);
 vec3 refr=vec3(frosted(dr,.09).r,frosted(dg,.09).g,frosted(db,.09).b);
 refr*=exp(-(l0+l1+l2)/3.*vec3(.32,.62,.12));
 float nv=max(dot(n,-rd),0.);float F=.04+.96*pow(1.-nv,5.);
 vec3 color=refr*(1.-F)+frosted(reflect(rd,n),.05)*F*1.1;
 // A little milkiness over everything, in lilac.
 color=mix(color,vec3(.62,.52,.88),.06);
 return vec4(pow(aces(color*.75),vec3(1./2.2))*cov,cov);}
void main(){
 M=rotAxis(normalize(vec3(.62,1.,.4)),-(time*.5+.6+6.2832*(1.-pow(1.-clamp(since/1.3,0.,1.),3.))));
 frag=render(gl_FragCoord.xy);}
`;

export default function GlassGlyph({ active }) {
  return <ShaderGlyph fragment={FS} variant="glass" stillTime={1.2} active={active} />;
}
