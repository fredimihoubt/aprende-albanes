// Phaser bootstrap y montaje en #gameMount

window.__launchScene = function(sceneName){
  const mount = document.getElementById('gameMount');
  mount.innerHTML = '';
  // Crear canvas dentro del contenedor
  const config = {
    type: Phaser.AUTO,
    parent: 'gameMount',
    width: Math.min(720, mount.clientWidth || 720),
    height: 400,
    backgroundColor: '#f8fafc',
    physics: { default: 'arcade', arcade: { debug:false } },
    scene: [BootScene, PreloadScene, HomeScene, MarketScene, RestaurantScene]
  };
  const game = new Phaser.Game(config);
  game.scene.start(sceneName||'HomeScene');
};

// Escenas (definidas en este mismo archivo por simplicidad)
class BootScene extends Phaser.Scene{
  constructor(){ super('BootScene'); }
  preload(){ }
  create(){ this.scene.start('PreloadScene'); }
}
class PreloadScene extends Phaser.Scene{
  constructor(){ super('PreloadScene'); }
  preload(){
    // Placeholders
    this.load.image('house','img/house.png');
    this.load.image('table','img/table.png');
    this.load.image('apple','img/apple.png');
    this.load.image('bread','img/bread.png');
    this.load.image('npc','img/npc.png');
  }
  create(){ this.scene.start('HomeScene'); }
}

// Helper UI
function makeButton(scene, x,y, label, cb){
  const bg = scene.add.rectangle(x,y,140,36,0x111827).setInteractive({useHandCursor:true});
  const tx = scene.add.text(x,y,label,{fontSize:'16px',color:'#ffffff'}).setOrigin(0.5);
  bg.on('pointerdown', cb);
  return {bg,tx};
}

// CASA: arrastrar palabra al objeto
class HomeScene extends Phaser.Scene{
  constructor(){ super('HomeScene'); }
  create(){
    this.add.text(12,12,'Casa: Arrastra la palabra al objeto correcto',{fontSize:'16px',color:'#111'});
    const table = this.physics.add.image(160,220,'table').setScale(0.7).setInteractive();
    const apple = this.physics.add.image(340,220,'apple').setScale(0.7).setInteractive();

    const words = [
      { txt:'bukë (pan)', target: table },
      { txt:'mollë (manzana)', target: apple }
    ];
    let score = 0;
    words.forEach((w,i)=>{
      const t = this.add.text(120+i*220,360,w.txt,{fontSize:'16px',backgroundColor:'#e5e7eb',padding:6}).setInteractive({draggable:true});
      this.input.setDraggable(t);
      t.on('drag', (pointer,dragX,dragY)=>{ t.x=dragX; t.y=dragY; });
      t.on('dragend', ()=>{
        const d = Phaser.Math.Distance.Between(t.x,t.y,w.target.x,w.target.y);
        if(d<60){ score++; t.disableInteractive(); t.setAlpha(0.5); this.add.text(t.x,t.y-24,'✔',{fontSize:'18px', color:'#22c55e'}); }
        if(score===words.length){ this.time.delayedCall(400,()=>{
          alert('¡Bien! Has completado CASA.'); this.scene.start('MarketScene');
        }); }
      });
    });

    makeButton(this, 600, 28, 'Mercado', ()=>this.scene.start('MarketScene'));
  }
}

// MERCADO: elegir frase correcta
class MarketScene extends Phaser.Scene{
  constructor(){ super('MarketScene'); }
  create(){
    this.add.text(12,12,'Mercado: Elige la frase correcta',{fontSize:'16px',color:'#111'});
    this.add.image(120,220,'npc').setScale(0.8);
    const q = this.add.text(210,120,'Vendedor: Çfarë dëshironi? (¿Qué desea?)',{fontSize:'16px',wordWrap:{width:460}});

    const options = [
      { txt:'Dua një bukë, ju lutem (Quiero un pan, por favor)', correct:true },
      { txt:'Mirupafshim (Adiós)', correct:false },
      { txt:'Unë jam i lodhur (Estoy cansado)', correct:false }
    ];
    let y=180; let solved=false;
    options.forEach(opt=>{
      const r = this.add.rectangle(240,y,480,40,0xffffff).setStrokeStyle(1,0xe5e7eb).setOrigin(0);
      const t = this.add.text(250,y+10,opt.txt,{fontSize:'15px',color:'#111'});
      r.setInteractive({useHandCursor:true});
      r.on('pointerdown',()=>{
        if(solved) return; solved=true;
        if(opt.correct){ this.add.text(250,y-18,'¡Correcto! ✔',{color:'#22c55e'}); this.time.delayedCall(500,()=>this.scene.start('RestaurantScene')); }
        else { this.add.text(250,y-18,'Intenta de nuevo ✖',{color:'#ef4444'}); solved=false; }
      });
      y+=56;
    });

    makeButton(this, 90, 28, 'Casa', ()=>this.scene.start('HomeScene'));
    makeButton(this, 600, 28, 'Restaurante', ()=>this.scene.start('RestaurantScene'));
  }
}

// RESTAURANTE: construir frase (arrastrar palabras)
class RestaurantScene extends Phaser.Scene{
  constructor(){ super('RestaurantScene'); }
  create(){
    this.add.text(12,12,'Restaurante: Arrastra para formar la frase',{fontSize:'16px',color:'#111'});
    const target = 'Dua një kafe, ju lutem';
    const words = target.split(' ');

    const slots = [];
    for(let i=0;i<words.length;i++){
      const r = this.add.rectangle(80+i*110,220,100,36,0xffffff).setStrokeStyle(1,0x94a3b8);
      slots.push(r);
    }
    const shuffled = [...words].sort(()=>Math.random()-0.5);
    shuffled.forEach((w,i)=>{
      const t = this.add.text(70+i*110,320,w,{fontSize:'16px',backgroundColor:'#e5e7eb',padding:6}).setInteractive({draggable:true});
      this.input.setDraggable(t);
      t.on('drag', (p,x,y)=>{ t.x=x; t.y=y; });
      t.on('dragend', ()=>{
        // Snap al slot más cercano
        let best=null, dmin=1e9, idx=-1;
        slots.forEach((s,j)=>{ const d=Phaser.Math.Distance.Between(t.x,t.y,s.x,s.y); if(d<dmin){dmin=d; best=s; idx=j;} });
        if(best && dmin<60){ t.x=best.x-40; t.y=best.y-10; t.slot=idx; }
        checkSolved();
      });
    });
    const checkSolved = ()=>{
      const placed = this.children.list.filter(o=>o.text && typeof o.slot==='number').sort((a,b)=>a.slot-b.slot).map(o=>o.text);
      if(placed.length===words.length && placed.join(' ')===target){
        this.add.text(80,180,'¡Perfecto! ✔',{color:'#22c55e'});
      }
    };

    makeButton(this, 90, 28, 'Mercado', ()=>this.scene.start('MarketScene'));
  }
}
