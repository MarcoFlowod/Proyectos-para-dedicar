    // ---------- Escena 3D ----------
    const canvas=document.getElementById("c"),
          renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!0});
          renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),
          renderer.setSize(innerWidth,innerHeight);

    const scene=new THREE.Scene,
          camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,5000);
    let targetDist=300,currentDist=300,rotX=.2,rotY=0;

    const loader=new THREE.TextureLoader,
          nebulaTex=loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/space/px.jpg");
          scene.background=nebulaTex;

    // Estrellas
    (function(e=2000,t=3000){
        const n=new THREE.BufferGeometry,a=new Float32Array(3*e);
        for(let n=0;n<e;n++){
          const e=t*(.3+.7*Math.random()),
                r=Math.random()*Math.PI*2,
                i=Math.acos(2*Math.random()-1);
            a[3*n+0]=e*Math.sin(i)*Math.cos(r),
            a[3*n+1]=e*Math.cos(i),
            a[3*n+2]=e*Math.sin(i)*Math.sin(r)
        }
      n.setAttribute("position",new THREE.BufferAttribute(a,3)),
      scene.add(new THREE.Points(n,new THREE.PointsMaterial({size:1.5,color:16777215,depthWrite:!1})))
    })();

    // Núcleo
    const coreMat=new THREE.MeshPhongMaterial({color:1118481,transparent:!0,opacity:.6,shininess:200}),
          core=new THREE.Mesh(new THREE.SphereGeometry(40,64,64),coreMat);
    scene.add(core);

    // Texto central
    function makeCenterTextTexture(e){
        const t=document.createElement("canvas");
        t.width=512,t.height=512;
        const n=t.getContext("2d");
        return n.clearRect(0,0,t.width,t.height),
        n.font="bold 80px Arial",
        n.textAlign="center",
        n.textBaseline="middle",
        n.fillStyle="#ff0033",
        n.shadowColor="#ff66aa",
        n.shadowBlur=50,
        n.fillText(e,t.width/2,t.height/2),
        new THREE.CanvasTexture(t)
    }
    const centerTex=makeCenterTextTexture("TE AMO ❤️"),
          centerMat=new THREE.SpriteMaterial({map:centerTex,transparent:!0}),
          centerSprite=new THREE.Sprite(centerMat);
    centerSprite.scale.set(60,60,1),
    centerSprite.position.set(0,0,0),
    centerSprite.renderOrder=999,
    scene.add(centerSprite);

    // Anillos y brillo
    function makeGlow(e=768,t="255,160,0",n="255,60,0"){
        const a=document.createElement("canvas");
        a.width=a.height=e;
        const r=a.getContext("2d"),
            i=r.createRadialGradient(e/2,e/2,.05*e,e/2,e/2,.5*e);
        return i.addColorStop(0,"rgba("+t+",0.9)"),
        i.addColorStop(.5,"rgba("+n+",0.5)"),
        i.addColorStop(1,"rgba(0,0,0,0)"),
        r.fillStyle=i,r.fillRect(0,0,e,e),
        new THREE.CanvasTexture(a)
    }
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlow(),transparent:!0,depthWrite:!1}));
    glow.scale.set(500,500,1),scene.add(glow);

    // Anillos
    function ringTexture(e=768){
        const t=document.createElement("canvas");
        t.width=t.height=e;
        const n=t.getContext("2d");
        n.translate(e/2,e/2);
        const a=.34*e,r=.49*e,
            i=n.createRadialGradient(0,0,.3*a,0,0,r);
        return i.addColorStop(0,"rgba(255,255,200,1)"),
        i.addColorStop(.3,"rgba(255,160,60,0.9)"),
        i.addColorStop(.65,"rgba(255,80,0,0.6)"),
        i.addColorStop(1,"rgba(0,0,0,0)"),
        n.fillStyle=i,n.beginPath(),
        n.arc(0,0,r,0,2*Math.PI),
        n.arc(0,0,a,0,2*Math.PI,!0),
        n.closePath(),n.fill(),
        new THREE.CanvasTexture(t)
    }
    const ring1=new THREE.Mesh(new THREE.RingGeometry(60,80,128),new THREE.MeshBasicMaterial({map:ringTexture(),transparent:!0,side:THREE.DoubleSide})),
          ring2=new THREE.Mesh(new THREE.RingGeometry(85,100,128),new THREE.MeshBasicMaterial({map:ringTexture(),transparent:!0,side:THREE.DoubleSide,opacity:.6}));
    ring1.rotation.x=ring2.rotation.x=Math.PI/2,
    scene.add(ring1),scene.add(ring2);

    // Frases románticas
    const WORDS=[],baseWords=[
        "💖 Mi amor", "🌞 Mi sol", "🌎 Mi mundo", "✨ Brillas", "❤️ Te amo", "🌌 Universo",

        "👑 Mi Rey", "🌠 Estrella", "💫 Mi cielo", "🔥 Siempre tú", "🎶 Tu risa",  "🦋 Libertad",

        "💎 Eres todo", "🙏 Gracias", "💕 Cariño", "🌹 Amor eterno", "🤗 Abrazos",  "🌸 Esperanza",

        "🌈 Alegría", "🌟 Contigo", "🧸 Ternura", "🎁 Mi razón", "🌙 Mi destino",  "💌 Recuerdos",

        "🕊️ Mi paz", "🪐 Mi universo", "🌊 Mi calma", "💡 Mi luz", "🍒 Dulzura", "🥰 Mi vida",

        "🎇 Felicidad", "🌻 Alegría", "🌺 Mi flor", "💜 Eternidad", "🌟 Sueños",  "✨ Magia",

        "🎵 Canción", "🔥 Pasión", "⭐ Mi estrella", "🌴 Mi paraíso", "🌄 Amanecer", "🌃 Noche contigo",

        "🎉 Mi fiesta", "💫 Inspiración", "🌷 Siempre juntos", "🎀 Mi ternura", "🍀 Mi fortuna", "🪞 Mi reflejo"
    ];
    for(let e=0;e<6;e++)WORDS.push(...baseWords);

    function makeTextTexture(e,t){
        const n=document.createElement("canvas");
        n.width=512,n.height=128;
        const a=n.getContext("2d");
        return a.clearRect(0,0,n.width,n.height),
        a.font="bold 60px Arial",
        a.textAlign="center",
        a.textBaseline="middle",
        a.fillStyle="#fff",
        a.shadowColor=t,
        a.shadowBlur=30,
        a.fillText(e,n.width/2,n.height/2),
        new THREE.CanvasTexture(n)
    }

    const COLORS=["#ff66ff","#66ccff","#ffd36b","#ff9966","#8df59a","#ffa0f8","#c6a7ff","#ff4444","#44ff99","#99ccff"],
          textGroup=new THREE.Group;
    scene.add(textGroup);

    for(let e=0;e<WORDS.length;e++){
        const t=makeTextTexture(WORDS[e],COLORS[e%COLORS.length]),
            n=new THREE.SpriteMaterial({map:t,transparent:!0}),
            a=new THREE.Sprite(n);
        a.scale.set(50,16,1);
        const r=Math.acos(2*Math.random()-1),
            i=Math.random()*Math.PI*2,
            o=150+120*Math.random();
        a.position.set(o*Math.sin(r)*Math.cos(i),o*Math.cos(r),o*Math.sin(r)*Math.sin(i)),
        a.userData={phi:r,theta:i,radius:o,speed:.001+.001*Math.random()},
        textGroup.add(a)
    }

    // Interacción con mouse/touch
    let dragging=!1,lastX=0,lastY=0;
    function onDown(e){dragging=!0;const t=e.touches?e.touches[0]:e;lastX=t.clientX,lastY=t.clientY}
    function onMove(e){if(!dragging)return;const t=e.touches?e.touches[0]:e,n=(t.clientX-lastX)/innerWidth,a=(t.clientY-lastY)/innerHeight;rotY-=3*n,rotX=Math.max(-1.2,Math.min(1.2,rotX-2.2*a)),lastX=t.clientX,lastY=t.clientY}
    function onUp(){dragging=!1}
    addEventListener("mousedown",onDown),
    addEventListener("mousemove",onMove),
    addEventListener("mouseup",onUp),
    addEventListener("touchstart",onDown,{passive:!0}),
    addEventListener("touchmove",onMove,{passive:!0}),
    addEventListener("touchend",onUp,{passive:!0}),
    addEventListener("wheel",(e=>{targetDist+=.25*e.deltaY,targetDist=Math.max(160,Math.min(600,targetDist))}),{passive:!0});

    let pinch=0;
    addEventListener("touchmove",(e=>{
        if(e.touches&&2===e.touches.length){
            e.preventDefault();
            const t=e.touches[0].clientX-e.touches[1].clientX,
                n=e.touches[0].clientY-e.touches[1].clientY,
                a=Math.hypot(t,n);
            pinch&&(targetDist+=.5*(pinch-a),targetDist=Math.max(160,Math.min(600,targetDist))),
            pinch=a
        }
    }),{passive:!1}),
    addEventListener("touchend",(()=>{pinch=0}),{passive:!0});

    // Animación
    let t=0;
    function tick(){
        requestAnimationFrame(tick),
        t+=.01,
        ring1.rotation.z+=.002,
        ring2.rotation.z-=.0015,
        glow.scale.set(500*(1+.03*Math.sin(.4*t)),500*(1+.03*Math.sin(.4*t)),1);
        const e=1+.05*Math.sin(3*t);
        core.scale.set(e,e,e),
        textGroup.children.forEach((e=>{
            e.material.opacity=.8+.2*Math.sin(2*t),
            e.userData.theta+=e.userData.speed,
            e.position.x=e.userData.radius*Math.sin(e.userData.phi)*Math.cos(e.userData.theta),
            e.position.z=e.userData.radius*Math.sin(e.userData.phi)*Math.sin(e.userData.theta)
        })),
        currentDist+=.06*(targetDist-currentDist);
        const n=Math.cos(rotX),a=Math.sin(rotX),r=Math.cos(rotY),i=Math.sin(rotY);
        camera.position.set(currentDist*i*n,currentDist*a,currentDist*r*n),
        camera.lookAt(0,0,0),
        renderer.render(scene,camera)
    }
    tick();