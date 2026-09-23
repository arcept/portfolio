'use client';

import ShaderGlyph from './ShaderGlyph';

// "Start with a question": a white plastic keyboard of four keys — the amber question mark, the
// backspace arrow, Ctrl and Alt — and the question mark key presses itself over and over. Ray-marched
// like the orb (see OrbGlyph.js): a housing with a recess, four dished keycaps, soft edges, no floor.
// The keycap legends are drawn once into a 2×2 texture (question mark, arrow, Ctrl, Alt) and looked
// up by each key's top face.

const FS = `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 resolution;uniform float time,lightTheme;
uniform sampler2D legend;uniform float since;
const float PI=3.14159265;
const float KEY=.25;
// Long enough that the keyboard fills its slot, as the orb does.
const float FOCAL=2.8;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float box3(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
vec2 pick(vec2 a,vec2 b){return a.x<b.x?a:b;}
// The question mark key goes down for a moment every couple of seconds.
// Activating the principle presses it straight away (since counts seconds from that moment).
float pressed(){float p=fract(time/2.7);float loop=smoothstep(.5,.58,p)*(1.-smoothstep(.68,.8,p));float kick=smoothstep(0.,.1,since)*(1.-smoothstep(.22,.5,since));return max(loop,kick);}
vec3 model(vec3 p){p.xz*=rot(.5+.09*sin(time*.5));p.yz*=rot(.05*sin(time*.37));return p;}
vec2 object(vec3 p){vec3 q=model(p);
 // A thin, low frame: the keys stand well clear of it, so their height shows.
 float housing=max(box3(q-vec3(0.,-.1,0.),vec3(.5,.06,.5),.08),-box3(q-vec3(0.,.1,0.),vec3(.46,.1,.46),.04));
 // A second, slightly narrower slab underneath, with a visible seam.
 housing=min(housing,box3(q-vec3(0.,-.28,0.),vec3(.47,.04,.47),.05));
 vec2 h=vec2(housing,1.);
 for(int i=0;i<4;i++){
  vec3 c=vec3((i%2==0?-1.:1.)*KEY,.17-(i==0?.09*pressed():0.),(i<2?-1.:1.)*KEY);
  vec3 k=q-c;
  // A real keycap tapers: wide at the base, narrower across the top. The taper makes the distance
  // an underestimate, hence the .8.
  float hw=mix(.18,.125,clamp((k.y+.09)/.18,0.,1.));
  float cap=.8*box3(k,vec3(hw,.09,hw),.05);
  cap=max(cap,-(length(k-vec3(0.,.62,0.))-.5)); // the shallow dish on top
  h=pick(h,vec2(cap,i==0?3.:2.));
 }
 return h;}
float map(vec3 p){return object(p).x;}
vec3 norm(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
float shadow(vec3 p,vec3 l){float t=.022,res=1.;for(int i=0;i<30;i++){float d=map(p+l*t);res=min(res,5.*max(d,0.)/t);t+=clamp(d,.022,.14);if(t>3.)break;}return clamp(res,0.,1.);}
float ao(vec3 p,vec3 n){float occ=0.,w=1.;for(int i=1;i<=4;i++){float d=.035*float(i);occ+=(d-map(p+n*d))*w;w*=.55;}return clamp(1.-occ*3.,.25,1.);}
vec3 env(vec3 d,float rough){vec3 col=mix(vec3(.10,.11,.13),vec3(.34,.35,.37),lightTheme);col+=vec3(.12,.14,.17)*max(d.y,0.);
 vec3 l=normalize(vec3(-.9,1.7,1.5));float a=acos(clamp(dot(d,l),-1.,1.));col+=vec3(3.4,3.2,3.0)*exp(-a*a/(.012+rough*.11));
 vec3 r=normalize(vec3(1.5,.65,-.8));float b=acos(clamp(dot(d,r),-1.,1.));col+=vec3(1.3,1.6,2.0)*exp(-b*b/(.017+rough*.10));
 vec3 f=normalize(vec3(.3,1.,-.2));float c=acos(clamp(dot(d,f),-1.,1.));col+=vec3(1.1)*exp(-c*c/(.035+rough*.14));return col;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 surface(vec3 p,vec3 n,vec3 rd,float id){
 vec3 base=vec3(.86,.85,.82);float rough=.42,coat=.25;
 if(id>2.5){base=vec3(.96,.40,.02);rough=.38;coat=.3;}
 else if(id>1.5){base=vec3(.93,.92,.90);rough=.36;}
 // Legend on the top face of a key.
 if(id>1.5&&n.y>.7){
  vec3 q=model(p);float ix=q.x>0.?1.:0.,iz=q.z>0.?1.:0.;
  vec2 uv=(q.xz-vec2((ix*2.-1.)*KEY,(iz*2.-1.)*KEY))/.27+.5;
  if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.){vec4 L=texture(legend,(vec2(ix,iz)+uv)*.5);base=mix(base,L.rgb,L.a);}
 }
 vec3 v=-rd;float nv=max(dot(n,v),.001);vec3 f0=vec3(.04);vec3 fres=f0+(1.-f0)*pow(1.-nv,5.);float oc=ao(p,n);
 vec3 color=base*vec3(.24,.25,.27)*oc;
 vec3 l=normalize(vec3(-.9,1.7,1.5));vec3 l2=normalize(vec3(1.5,.65,-.8));
 for(int i=0;i<2;i++){vec3 li=i==0?l:l2;vec3 radiance=i==0?vec3(3.2,3.0,2.8):vec3(.7,.95,1.3);float nl=max(dot(n,li),0.);vec3 h=normalize(li+v);float nh=max(dot(n,h),0.);float vh=max(dot(v,h),0.);float alpha=rough*rough;float a2=alpha*alpha;float D=a2/(PI*pow(nh*nh*(a2-1.)+1.,2.)+.0001);float k=pow(rough+1.,2.)/8.;float G=(nl/(nl*(1.-k)+k))*(nv/(nv*(1.-k)+k));vec3 F=f0+(1.-f0)*pow(1.-vh,5.);vec3 spec=D*G*F/max(4.*nl*nv,.001);float sh=i==0?shadow(p+n*.009,li):1.;color+=(base/PI+spec)*radiance*nl*sh;}
 color+=env(reflect(rd,n),rough)*fres*oc*.6;
 color+=env(reflect(rd,n),.12)*pow(1.-nv,4.)*coat*.10;
 return color;}
vec4 render(vec2 coord){
 vec2 st=(coord-.5*resolution)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,3.5,3.1);vec3 target=vec3(0.,-.1,0.);
 vec3 ww=normalize(target-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(st.x*uu+st.y*vv+FOCAL*ww);
 // Only march inside a sphere that holds the object.
 vec3 oc=ro-vec3(0.,-.1,0.);float b=dot(oc,rd);float h=b*b-(dot(oc,oc)-1.44);
 if(h<0.)return vec4(0.);
 h=sqrt(h);float t=max(-b-h,0.),tmax=-b+h;
 float md=1e9,mt=t;bool hit=false;
 for(int i=0;i<160;i++){float d=map(ro+rd*t);if(d<.00055){hit=true;break;}if(d<md){md=d;mt=t;}t+=max(d*.85,.0006);if(t>tmax)break;}
 float cov=1.;vec3 p;
 if(hit){p=ro+rd*t;}
 else{
  // A ray that just missed: soft edge coverage from how close it came.
  float w=mt/(FOCAL*min(resolution.x,resolution.y));
  cov=clamp(1.-md/(w*1.5),0.,1.);
  if(cov<=0.)return vec4(0.);
  p=ro+rd*mt;
 }
 vec3 n=norm(p);vec3 color=surface(p,n,rd,object(p).y);
 return vec4(pow(aces(color),vec3(1./2.2))*cov,cov);}
void main(){frag=render(gl_FragCoord.xy);}
`;

// The four legends, one per tile of a 2x2 sheet: question mark (white, on the yellow key), backspace
// arrow, Ctrl, Alt (solid black, on white keys). Straight alpha, so the shader blends by coverage.
function makeLegend(gl) {
  const size = 512;
  const sheet = document.createElement('canvas');
  sheet.width = size;
  sheet.height = size;
  const ctx = sheet.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 200px "Arial Rounded MT Bold", Arial, Helvetica, sans-serif';
  ctx.fillText('?', 128, 142);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(316, 128);
  ctx.lineTo(452, 128);
  ctx.moveTo(360, 84);
  ctx.lineTo(316, 128);
  ctx.lineTo(360, 172);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = '800 100px Arial, Helvetica, sans-serif';
  ctx.fillText('Ctrl', 128, 388);
  ctx.fillText('Alt', 384, 388);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

export default function KeysGlyph({ active }) {
  // Still frame: mid-press, so reduced motion shows the question mark key down.
  return <ShaderGlyph fragment={FS} variant="keys" makeTexture={makeLegend} active={active} stillTime={2.7 * 0.66} />;
}
