'use client';

import ShaderGlyph from './ShaderGlyph';
import useGem from './gem';

// "Start with a question": a clear glass cut gem with a very high index of refraction and edges
// that are sharp but not razor-sharp (a small radius). Ray-marched like the cube (see GlassGlyph.js):
// the ray bends as it enters, is followed to where it leaves — bouncing inside as often as it must,
// which at this index is a lot, so the facets glitter — and bends again on the way out, once per
// colour channel with its own index, which splits the light into a spectrum along the edges. No frost, and a tint
// (blue or emerald; see gem.js). What it sees through itself is a small studio of soft panels,
// so the facets read as smooth gradients with a spectrum only where the light bends hardest.

// The two tones differ only in what the glass absorbs and the tint it is nudged toward. Blue soaks up
// red hard and green a little (pale sky in the thin parts, navy in the thick); emerald soaks up red hard, and leans between a teal-green (soaking up a little blue) and blue (soaking up green)
// depending on where the light exits, so the gem reads as deep green shot through with blue.
const TONES = {
  blue: { absorb: 'vec3(1.5,.7,.10)', tint: 'vec3(.55,.85,1.2)', gain: '.9', glow: 'vec3(0.)', cap: '1000.' },
  emerald: { absorb: 'mix(vec3(7.0,1.0,3.0),vec3(6.0,1.4,1.15),bl)', tint: 'mix(vec3(.3,.9,.68),vec3(.3,.85,.9),bl)', gain: '.62', glow: 'vec3(.015,.06,.06)', cap: '1.8' },
};

const shader = (tone) => `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 resolution;uniform float time,lightTheme,since;
const float PI=3.14159265;
// Sized so the gem fills its slot as the other glyphs do.
const float FOCAL=2.45;
const float RAD=.045;   // edge radius
mat3 M;
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 rotZ(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
// A cut gem with 26 facets: a cube whose corners and edges are shaved off. Folding by abs() leaves only
// three families of plane to test — the 6 cube faces, the 8 corner cuts and the 12 edge cuts — and
// combining the families as a vector rounds the edges between them.
float sdf(vec3 p){
 vec3 q=abs(M*p);
 float c=max(q.x,max(q.y,q.z))-(.62-RAD);
 float o=(q.x+q.y+q.z)*.5773503-(.80-RAD);
 float e=max(q.x+q.y,max(q.y+q.z,q.x+q.z))*.7071068-(.78-RAD);
 vec3 v=vec3(c,o,e);
 return .8*(length(max(v,0.))+min(max(v.x,max(v.y,v.z)),0.)-RAD);}
vec3 norm(vec3 p){vec2 e=vec2(.005,0.);return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx)));}
vec3 env(vec3 d){
 // Soft studio panels, not hard bands: broad pale panels above and to the sides, a deep floor. What
 // shows through the glass is then smooth gradients, as in a rendered crystal.
 vec3 top=mix(vec3(.86,.93,1.),vec3(.95,.98,1.),lightTheme);
 vec3 bot=mix(vec3(.06,.10,.22),vec3(.42,.52,.72),lightTheme);
 vec3 col=mix(bot,top,smoothstep(-.7,.9,d.y));
 col+=vec3(1.5,1.7,2.0)*exp(-pow((d.y-.35)*3.2,2.));
 col+=vec3(1.2,1.4,1.8)*exp(-pow((d.x+.55)*2.6,2.))*smoothstep(-.6,.4,d.y);
 col+=vec3(1.0,1.0,1.1)*exp(-pow((d.x-.6)*3.,2.))*smoothstep(-.4,.5,d.y);
 col*=1.-.7*exp(-pow((d.y+.3)*4.,2.));
 vec3 l1=normalize(vec3(-.5,.75,.6));vec3 l2=normalize(vec3(.6,.1,.7));
 col+=vec3(3.)*exp(-pow(acos(clamp(dot(d,l1),-1.,1.)),2.)/.05);
 col+=vec3(2.,2.2,2.6)*exp(-pow(acos(clamp(dot(d,l2),-1.,1.)),2.)/.08);
 return col;}
// Follows a ray into the glass and out again; returns where it leaves and how far it travelled inside.
vec3 through(vec3 p,vec3 n,vec3 rd,float ior,out float len){
 vec3 r=refract(rd,n,1./ior);if(dot(r,r)<.001)r=reflect(rd,n);
 vec3 pp=p-n*.004;len=0.;
 for(int b=0;b<4;b++){
  float t=.01;for(int i=0;i<30;i++){float d=-sdf(pp+r*t);if(d<.004)break;t+=d*.9;if(t>3.)break;}
  pp+=r*t;len+=t;
  vec3 nn=norm(pp);
  vec3 ex=refract(r,-nn,ior);
  if(dot(ex,ex)>.001)return ex;
  r=reflect(r,nn);pp-=nn*.004;
 }
 return r;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec4 render(vec2 coord){
 vec2 st=(coord-.5*resolution)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,.3,4.8);vec3 target=vec3(0.);
 vec3 ww=normalize(target-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(st.x*uu+st.y*vv+FOCAL*ww);
 float b=dot(ro,rd);float h=b*b-(dot(ro,ro)-1.5);
 if(h<0.)return vec4(0.);
 h=sqrt(h);float t=max(-b-h,0.),tmax=-b+h;
 float md=1e9,mt=t;bool hit=false;
 for(int i=0;i<110;i++){float d=sdf(ro+rd*t);if(d<.0006){hit=true;break;}if(d<md){md=d;mt=t;}t+=d*.9;if(t>tmax)break;}
 float cov=1.;vec3 p;
 if(hit){p=ro+rd*t;}
 else{
  float w=mt/(FOCAL*min(resolution.x,resolution.y));
  cov=clamp(1.-md/(w*1.6),0.,1.);
  if(cov<=0.)return vec4(0.);
  p=ro+rd*mt;
 }
 vec3 n=norm(p);
 // A very high index, split per channel: the dispersion.
 float l0,l1,l2;
 vec3 dr=through(p,n,rd,2.00,l0),dg=through(p,n,rd,2.10,l1),db=through(p,n,rd,2.22,l2);
 vec3 refr=vec3(env(dr).r,env(dg).g,env(db).b);
 // Royal blue: the glass soaks up red hard and green a little, so thin parts stay pale sky-blue and
 // the long paths through the thick parts go deep navy.
 // For emerald, long paths saturate instead of going black (cap), so the thick facets stay a deep
 // colour, not a hole. Blue is uncapped.
 float len=${TONES[tone].cap}*(1.-exp(-(l0+l1+l2)/3./${TONES[tone].cap}));
 // Which way the light left the glass picks, smoothly, between the tone's two leanings (bl = 0..1).
 float bl=smoothstep(-1.,1.,dot(normalize(dr+dg+db),vec3(.7,.5,.2)));
 refr*=exp(-len*${TONES[tone].absorb});
 refr=mix(refr,refr*${TONES[tone].tint},.25);
 refr+=${TONES[tone].glow};
 float nv=max(dot(n,-rd),0.);float F=.05+.95*pow(1.-nv,5.);
 vec3 color=refr*(1.-F)+env(reflect(rd,n))*F*.9;
 return vec4(pow(aces(color*${TONES[tone].gain}),vec3(1./2.2))*cov,cov);}
void main(){
 // Turning about a tilted axis, seen from a little above: spin, then lean it toward the viewer and
 // over to one side so it never sits square.
 float spin=time*.55+.4+6.2832*(1.-pow(1.-clamp(since/1.3,0.,1.),3.));
 M=rotZ(.28)*rotX(.42)*rotY(spin);
 frag=render(gl_FragCoord.xy);}
`;

const SHADERS = { blue: shader('blue'), emerald: shader('emerald') };

export default function PyramidGlyph({ active }) {
  const gem = useGem();
  return <ShaderGlyph fragment={SHADERS[gem]} variant="pyramid" stillTime={1.4} active={active} />;
}
