'use client';

import ShaderGlyph from './ShaderGlyph';

// The blue ribbed sphere with its chrome collar: "Evidence needs interpretation", from the
// real-3d-motion study. The study's lighting, materials and motion, cut down to this one object,
// with no floor or backdrop and soft edges so it sits directly on the page.

const FS = `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 resolution;uniform float time,lightTheme,since;
const float PI=3.14159265;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float torus(vec3 p,vec2 t){return length(vec2(length(p.xz)-t.x,p.y))-t.y;}
vec2 pick(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec3 model(vec3 p){p-=vec3(0.,.13,0.);p.xz*=rot(-.34+.13*sin(time*.43)+time*.32+6.2832*(1.-pow(1.-clamp(since/1.3,0.,1.),3.)));p.yz*=rot(.06*sin(time*.35));p.xy*=rot(-.07+.035*cos(time*.31));return p;}
vec2 object(vec3 p){vec3 q=model(p);
 vec3 v=q;v.xy*=rot(.35);v.yz*=rot(.30);float r=length(v);float radial=length(v.xz);float theta=atan(v.z,v.x)+v.y*.95;float pole=pow(clamp(radial/max(r,.001),0.,1.),1.25);
 float ribs=pow(.5+.5*cos(theta*14.),.72);float radius=.69+.14*ribs*pole;
 vec2 h=vec2((r-radius)*.28,3.);
 vec3 center=v-vec3(0.,.69,0.);
 return pick(h,vec2(torus(center,vec2(.13,.022)),2.));}
float map(vec3 p){return object(p).x;}
vec3 norm(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
float shadow(vec3 p,vec3 l){float t=.022,res=1.;for(int i=0;i<30;i++){float d=map(p+l*t);res=min(res,5.*max(d,0.)/t);t+=clamp(d,.022,.14);if(t>3.)break;}return clamp(res,0.,1.);}
float ao(vec3 p,vec3 n){float occ=0.,w=1.;for(int i=1;i<=4;i++){float d=.035*float(i);occ+=(d-map(p+n*d))*w;w*=.55;}return clamp(1.-occ*3.,.25,1.);}
vec3 env(vec3 d,float rough){vec3 col=mix(vec3(.055,.065,.08),vec3(.20,.22,.25),lightTheme);col+=vec3(.12,.14,.17)*max(d.y,0.);
 vec3 l=normalize(vec3(-.9,1.7,1.5));float a=acos(clamp(dot(d,l),-1.,1.));float glow=exp(-a*a/(.012+rough*.11));col+=vec3(4.2,3.9,3.65)*glow;
 vec3 r=normalize(vec3(1.5,.65,-.8));float b=acos(clamp(dot(d,r),-1.,1.));col+=vec3(1.6,1.95,2.5)*exp(-b*b/(.017+rough*.10));
 vec3 f=normalize(vec3(.3,1.,-.2));float c=acos(clamp(dot(d,f),-1.,1.));col+=vec3(1.4)*exp(-c*c/(.035+rough*.14));return col;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 surface(vec3 p,vec3 n,vec3 rd,float id){vec3 base=vec3(.025,.21,.74);float metal=0.,rough=.28,coat=.4;
 if(id<2.5){base=vec3(.72,.78,.85);metal=1.;rough=.16;coat=.1;}
 vec3 v=-rd;float nv=max(dot(n,v),.001);vec3 f0=mix(vec3(.04),base,metal);vec3 fres=f0+(1.-f0)*pow(1.-nv,5.);float oc=ao(p,n);
 vec3 color=base*(1.-metal)*vec3(.17,.185,.21)*oc;
 vec3 l=normalize(vec3(-.9,1.7,1.5));vec3 l2=normalize(vec3(1.5,.65,-.8));
 for(int i=0;i<2;i++){vec3 li=i==0?l:l2;vec3 radiance=i==0?vec3(3.6,3.35,3.15):vec3(.7,.95,1.3);float nl=max(dot(n,li),0.);vec3 h=normalize(li+v);float nh=max(dot(n,h),0.);float vh=max(dot(v,h),0.);float alpha=rough*rough;float a2=alpha*alpha;float D=a2/(PI*pow(nh*nh*(a2-1.)+1.,2.)+.0001);float k=pow(rough+1.,2.)/8.;float G=(nl/(nl*(1.-k)+k))*(nv/(nv*(1.-k)+k));vec3 F=f0+(1.-f0)*pow(1.-vh,5.);vec3 spec=D*G*F/max(4.*nl*nv,.001);float sh=i==0?shadow(p+n*.009,li):1.;color+=(base*(1.-metal)/PI+spec)*radiance*nl*sh;}
 color+=env(reflect(rd,n),rough)*fres*oc*.72;
 color+=env(reflect(rd,n),.12)*pow(1.-nv,4.)*coat*.10;
 return color;}
vec4 render(vec2 coord){
 vec2 st=(coord-.5*resolution)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,1.38,4.65);vec3 target=vec3(0.,.03,0.);
 vec3 ww=normalize(target-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(st.x*uu+st.y*vv+2.53*ww);
 // The study frames the object with room around it; a glyph wants it to fill its slot, hence the
 // longer focal length above.
 // Only march inside a sphere that holds the object.
 vec3 oc=ro-vec3(0.,.13,0.);float b=dot(oc,rd);float h=b*b-(dot(oc,oc)-1.1025);
 if(h<0.)return vec4(0.);
 h=sqrt(h);float t=max(-b-h,0.),tmax=-b+h;
 float md=1e9,mt=t;bool hit=false;
 for(int i=0;i<160;i++){float d=map(ro+rd*t);if(d<.00055){hit=true;break;}if(d<md){md=d;mt=t;}t+=max(d*.68,.0006);if(t>tmax)break;}
 float cov=1.;vec3 p;
 if(hit){p=ro+rd*t;}
 else{
  // A ray that just missed: soft edge coverage from how close it came (distances here are scaled by ~.28).
  float w=mt/(2.53*min(resolution.x,resolution.y));
  cov=clamp(1.-md*3.57/(w*1.5),0.,1.);
  if(cov<=0.)return vec4(0.);
  p=ro+rd*mt;
 }
 vec3 n=norm(p);vec3 color=surface(p,n,rd,object(p).y);
 return vec4(pow(aces(color),vec3(1./2.2))*cov,cov);}
void main(){frag=render(gl_FragCoord.xy);}
`;

export default function OrbGlyph({ active }) {
  return <ShaderGlyph fragment={FS} variant="orb" active={active} />;
}
