// Perspective renderer for browsers without WebGL. Uses the same 3D meshes and camera.
import * as T from './vendor/three.module.js';
export class SoftwareRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.shadowMap={};this.cache=new WeakMap();this.light=new T.Vector3(.4,.9,.5).normalize();this.last='';}
 setPixelRatio(){} setClearColor(){} setSize(w,h){this.canvas.width=Math.round(w);this.canvas.height=Math.round(h);this.w=w;this.h=h;this.last='';}
 render(scene,camera){scene.updateMatrixWorld();camera.updateMatrixWorld();const w=this.w,h=this.h,ctx=this.ctx;ctx.fillStyle='#0c1420';ctx.fillRect(0,0,w,h);const glow=ctx.createRadialGradient(w*.5,h*.6,0,w*.5,h*.6,w*.65);glow.addColorStop(0,'#1b3544');glow.addColorStop(1,'#0c1420');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),faces=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),n=new T.Vector3(),v=new T.Vector3();
 scene.traverseVisible(o=>{if(!o.isMesh||o===scene||o.geometry.type==='CircleGeometry')return;let geo=o.geometry,mat=o.material;if(mat.opacity<.2)return;let p=geo.attributes.position,index=geo.index;let verts=[];const mvp=new T.Matrix4().multiplyMatrices(vp,o.matrixWorld);for(let j=0;j<p.count;j++){v.fromBufferAttribute(p,j).applyMatrix4(mvp);verts.push([(v.x*.5+.5)*w,(-v.y*.5+.5)*h,v.z])}const color=mat.color||new T.Color(0x888888),normal=new T.Matrix3().getNormalMatrix(o.matrixWorld);const count=index?index.count:p.count;
 for(let j=0;j<count;j+=3){const ia=index?index.getX(j):j,ib=index?index.getX(j+1):j+1,ic=index?index.getX(j+2):j+2;let av=verts[ia],bv=verts[ib],cv=verts[ic];if(av[2]<-1||bv[2]<-1||cv[2]<-1||av[2]>1||bv[2]>1||cv[2]>1)continue;if((bv[0]-av[0])*(cv[1]-av[1])-(bv[1]-av[1])*(cv[0]-av[0])>=0)continue;
 a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);n.subVectors(b,a).cross(c.sub(a)).normalize().applyMatrix3(normal).normalize();const light=.55+.45*Math.max(0,n.dot(this.light));const col=color.clone().multiplyScalar(light).convertLinearToSRGB();faces.push({av,bv,cv,z:(av[2]+bv[2]+cv[2])/3,color:'#'+col.getHexString(),alpha:mat.opacity??1});}});
 // Project a ground grid, then painter-sort shaded mesh triangles.
 ctx.lineWidth=.6;ctx.strokeStyle='#284555';for(let i=-7;i<=7;i++){for(const ends of [[[-7,-.56,i],[7,-.56,i]],[[i,-.56,-7],[i,-.56,7]]]){const pts=ends.map(p=>new T.Vector3(...p).applyMatrix4(vp));if(pts.some(p=>p.z>1||p.z<0))continue;ctx.beginPath();ctx.moveTo((pts[0].x*.5+.5)*w,(-pts[0].y*.5+.5)*h);ctx.lineTo((pts[1].x*.5+.5)*w,(-pts[1].y*.5+.5)*h);ctx.stroke()}}
 faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.beginPath();ctx.moveTo(f.av[0],f.av[1]);ctx.lineTo(f.bv[0],f.bv[1]);ctx.lineTo(f.cv[0],f.cv[1]);ctx.closePath();ctx.fill();ctx.lineWidth=.3;ctx.strokeStyle=f.color;ctx.stroke()}ctx.globalAlpha=1;
 }
}
