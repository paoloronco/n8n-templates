// Minimal metadata fixtures, not playable or generated media. No customer data.
const box=(type,...parts)=>{const payload=Buffer.concat(parts),head=Buffer.alloc(8);head.writeUInt32BE(payload.length+8);head.write(type,4);return Buffer.concat([head,payload]);};
function syntheticMp4(){
 const mvhd=Buffer.alloc(100);mvhd.writeUInt32BE(1000,12);mvhd.writeUInt32BE(18000,16);
 const track=(kind,codec)=>{const header=Buffer.alloc(84);header.writeUInt32BE((kind==='vide'?1080:0)*65536,76);header.writeUInt32BE((kind==='vide'?1920:0)*65536,80);const handler=Buffer.alloc(24);handler.write(kind,8);return box('trak',box('tkhd',header),box('mdia',box('hdlr',handler),box('minf',box('stbl',box('stsd',Buffer.alloc(8),box(codec,Buffer.alloc(40)))))));};
 return Buffer.concat([box('ftyp',Buffer.from('isom0000')),box('moov',box('mvhd',mvhd),track('vide','avc1'),track('soun','mp4a')),box('mdat',Buffer.alloc(1024))]);
}
function syntheticWav(){const rate=16000,length=18*rate*2,b=Buffer.alloc(44+length);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(length,40);for(let i=44;i<b.length;i+=2)b.writeInt16LE(Math.round(4000*Math.sin((i-44)/2*2*Math.PI*220/rate)),i);return b;}
module.exports={syntheticMp4,syntheticWav};
