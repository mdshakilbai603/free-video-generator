const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const genBtn=document.getElementById("genBtn");
const prompt=document.getElementById("prompt");
const framesInput=document.getElementById("frames");
const downloadBtn=document.getElementById("downloadBtn");

function drawFrame(text, t, total){
  const w=canvas.width, h=canvas.height;
  const g=ctx.createLinearGradient(0,0,w,h);
  const hue = Math.floor(40 + 240*(t/total));
  g.addColorStop(0, `hsl(${hue},50%,12%)`);
  g.addColorStop(1, `hsl(${(hue+120)%360},50%,20%)`);
  ctx.fillStyle=g;
  ctx.fillRect(0,0,w,h);

  ctx.fillStyle="#ffd700";
  ctx.font="20px sans-serif";
  wrap(text,20,40,w-40,26);

  ctx.fillStyle="#fff";
  ctx.font="14px sans-serif";
  ctx.fillText(`Frame ${t+1}/${total}`,20,h-20);
}

function wrap(text, x, y, maxW, lh){
  const words=text.split(" ");
  let line="";
  for(let n=0;n<words.length;n++){
    let test=line+words[n]+" ";
    if(ctx.measureText(test).width>maxW){
      ctx.fillText(line,x,y);
      line=words[n]+" ";
      y+=lh;
    }else line=test;
  }
  ctx.fillText(line,x,y);
}

genBtn.onclick=async ()=>{
  const idea=prompt.value.trim()||"Demo video";
  const total=parseInt(framesInput.value);

  const stream=canvas.captureStream(25);
  const rec=new MediaRecorder(stream,{mimeType:"video/webm; codecs=vp9"});
  let chunks=[];
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  rec.onstop=()=>{
    const blob=new Blob(chunks,{type:"video/webm"});
    const url=URL.createObjectURL(blob);
    downloadBtn.href=url;
    downloadBtn.download="video.webm";
    downloadBtn.style.display="block";
  };

  rec.start();
  for(let t=0;t<total;t++){
    drawFrame(idea,t,total);
    await new Promise(r=>setTimeout(r,40));
  }
  rec.stop();
};