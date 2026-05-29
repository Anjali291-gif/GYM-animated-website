// High Performance Interactive Dust Particle System & Parallax Dynamics

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Interactive Canvas Particle System (Dust Particles in Light Beams)
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('dust-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 120;
    
    // Mouse interaction states
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.2 + 0.5;
            this.baseSpeedX = (Math.random() * 0.15) - 0.075;
            this.baseSpeedY = -(Math.random() * 0.2 + 0.05); // Drifts upwards primarily
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            this.alpha = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.003 + 0.001;
            this.fadingIn = true;
            this.maxAlpha = Math.random() * 0.6 + 0.2;
            
            // Assign color based on position/randomness to match ambient glows
            const hueRandom = Math.random();
            if (hueRandom < 0.35) {
                this.color = `rgba(0, 229, 255, `; // Neon Blue
            } else if (hueRandom < 0.7) {
                this.color = `rgba(189, 0, 255, `; // Neon Purple
            } else {
                this.color = `rgba(255, 255, 255, `; // Warm light dust
            }
        }
        
        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            
            // Add subtle glow to larger particles
            if (this.size > 1.8) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color.includes('0, 229') ? '#00e5ff' : '#bd00ff';
            }
            
            ctx.fill();
            ctx.restore();
        }
        
        update() {
            // Smooth drift movement
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Re-wrap screen boundaries
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) {
                this.y = canvas.height;
                this.alpha = 0;
                this.fadingIn = true;
            }
            if (this.y > canvas.height) this.y = 0;
            
            // Interactive mouse repulsion (slow-motion organic dodge)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Apply gentle pushing force
                    this.speedX += (dx / distance) * force * 0.15;
                    this.speedY += (dy / distance) * force * 0.15;
                } else {
                    // Decay velocity back to base drift speeds
                    this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
                    this.speedY += (this.baseSpeedY - this.speedY) * 0.02;
                }
            } else {
                this.speedX += (this.baseSpeedX - this.speedX) * 0.01;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.01;
            }
            
            // Alpha pulsing/fading for realistic dust shine
            if (this.fadingIn) {
                this.alpha += this.fadeSpeed;
                if (this.alpha >= this.maxAlpha) {
                    this.fadingIn = false;
                }
            } else {
                this.alpha -= this.fadeSpeed;
                if (this.alpha <= 0.05) {
                    this.fadingIn = true;
                    this.maxAlpha = Math.random() * 0.6 + 0.2;
                }
            }
        }
    }
    
    // Initialize Particles
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // -------------------------------------------------------------------------
    // 2. Interactive Mouse 3D Depth Hover (Floating Barbell Tilt)
    // -------------------------------------------------------------------------
    const barbellWrapper = document.getElementById('barbell-wrapper');
    const barbellImg = document.getElementById('barbell-img');
    const shadow = document.getElementById('barbell-floor-shadow');
    
    document.addEventListener('mousemove', (e) => {
        // Calculate center deviations
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        // Offset values relative to screen center (-0.5 to 0.5)
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        
        // Smoothly update CSS vars for mouse tilt (gives 3D depth)
        const tiltX = dx * 15; // Shift max 15px horizontally
        const tiltY = dy * 10; // Shift max 10px vertically
        const rotateValX = -dy * 12; // Rotate based on vertical hover
        const rotateValY = dx * 12;  // Rotate based on horizontal hover
        
        // Apply interactive micro-adjustments onto the container
        barbellWrapper.style.setProperty('--parallax-offset-x', `${tiltX}px`);
        barbellWrapper.style.setProperty('--parallax-offset-y', `${tiltY}px`);
        
        // Tilt the actual barbell inside the container
        barbellImg.style.transform = `rotateY(${rotateValY}deg) rotateX(${rotateValX}deg)`;
        
        // Reposition shadow based on barbell movement
        shadow.style.transform = `rotateX(75deg) translate(${tiltX * 0.8}px, ${tiltY * 0.4}px)`;
    });
    
    // Reset positions when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
        barbellWrapper.style.setProperty('--parallax-offset-x', '0px');
        barbellWrapper.style.setProperty('--parallax-offset-y', '0px');
        barbellImg.style.transform = 'rotateY(0deg) rotateX(0deg)';
        shadow.style.transform = 'rotateX(75deg)';
    });

    // -------------------------------------------------------------------------
    // 3. Immersive Parallax Scroll System
    // -------------------------------------------------------------------------
    const depthTitle = document.getElementById('bg-depth-title');
    const lightsLeft = document.querySelector('.light-beam-left');
    const lightsRight = document.querySelector('.light-beam-right');
    const blueGlow = document.querySelector('.glow-blue');
    const purpleGlow = document.querySelector('.glow-purple');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // 1. Scroll background giant text downwards slower than the page scroll (depth)
        depthTitle.style.transform = `translateY(${scrollY * 0.4}px) scale(${1.05 + scrollY * 0.0003})`;
        
        // 2. Barbell moves up slightly slower than content (layered parallax)
        barbellWrapper.style.transform = `translate(var(--parallax-offset-x), calc(var(--parallax-offset-y) + ${scrollY * -0.15}px)) scale(${1 - scrollY * 0.0008})`;
        
        // 3. Shift ambient light positions to mimic dynamic light refraction during scroll
        if (lightsLeft) lightsLeft.style.transform = `rotate(-15deg) translateY(${scrollY * 0.15}px) translateX(${scrollY * -0.05}px)`;
        if (lightsRight) lightsRight.style.transform = `rotate(15deg) translateY(${scrollY * 0.15}px) translateX(${scrollY * 0.05}px)`;
        
        if (blueGlow) blueGlow.style.transform = `translate(${scrollY * 0.1}px, ${scrollY * 0.08}px)`;
        if (purpleGlow) purpleGlow.style.transform = `translate(${scrollY * -0.1}px, ${scrollY * -0.08}px)`;
        
        // 4. Fade hero elements as user scrolls down to avoid overlapping secondary section
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const opacityVal = Math.max(0, 1 - scrollY / 600);
            heroContent.style.opacity = opacityVal;
            heroContent.style.pointerEvents = opacityVal < 0.1 ? 'none' : 'auto';
        }
    });

    // -------------------------------------------------------------------------
    // 4. Dynamic Schedule Highlighting
    // -------------------------------------------------------------------------
    const currentDay = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    const todayRow = document.querySelector(`.hours-row[data-day="${currentDay}"]`);
    if (todayRow) {
        todayRow.classList.add('highlight');
        const dayLabel = todayRow.querySelector('.hours-day');
        if (dayLabel) {
            dayLabel.innerHTML += ` <span style="
                font-size: 0.7rem; 
                vertical-align: middle; 
                margin-left: 8px; 
                padding: 2px 7px; 
                background: rgba(189, 0, 255, 0.15); 
                border: 1px solid var(--neon-purple); 
                border-radius: 10px; 
                color: #fff;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                box-shadow: 0 0 8px var(--neon-purple-glow);
            ">TODAY</span>`;
        }
    }

    // -------------------------------------------------------------------------
    // 5. Free Trial Booking & Ticket Generator
    // -------------------------------------------------------------------------
    const trialForm = document.getElementById('free-trial-form');
    const trialFormCard = document.getElementById('trial-form-card');
    const vipTicket = document.getElementById('vip-ticket');
    
    if (trialForm) {
        // Set default date picker to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const dateInput = document.getElementById('trial-date');
        
        if (dateInput) {
            dateInput.setAttribute('min', tomorrowStr);
            dateInput.value = tomorrowStr;
        }
        
        trialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('trial-name').value;
            const rawDate = document.getElementById('trial-date').value;
            
            // Format date: e.g. "2026-05-30" -> "May 30, 2026"
            const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Generate random pass ID & barcode sequence
            const passNum = Math.floor(10000 + Math.random() * 90000);
            const passId = `MG-${passNum}`;
            const dateCode = rawDate.replace(/-/g, '');
            const barcodeSequence = `${passId}-${dateCode}`;
            
            // Populate Ticket fields
            document.getElementById('ticket-holder').textContent = name;
            document.getElementById('ticket-id').textContent = passId;
            document.getElementById('ticket-date').textContent = formattedDate;
            document.getElementById('barcode-num').textContent = barcodeSequence;
            
            // Transition out form card, transition in ticket
            trialFormCard.style.transition = 'all 0.4s ease';
            trialFormCard.style.opacity = '0';
            trialFormCard.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                trialFormCard.style.display = 'none';
                vipTicket.style.display = 'block';
                vipTicket.style.opacity = '0';
                vipTicket.style.transform = 'scale(0.8) rotateY(-10deg)';
                
                // Force layout recalculation
                void vipTicket.offsetWidth;
                
                vipTicket.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                vipTicket.style.opacity = '1';
                vipTicket.style.transform = 'scale(1) rotateY(0)';
            }, 400);
        });
    }
});
