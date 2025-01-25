const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

// Ustawienia dla canvas
canvas.width = 800;
canvas.height = 300;

document.getElementById('startButton').addEventListener('click', () => {
    const initialVelocity = parseFloat(document.getElementById('initialVelocity').value);
    const acceleration = parseFloat(document.getElementById('acceleration').value);
    const time = parseFloat(document.getElementById('time').value);

    if (isNaN(initialVelocity) || isNaN(acceleration) || isNaN(time)) {
        alert('Wprowadź poprawne wartości!');
        return;
    }

    // Ograniczenie animacji do 10s
    if (time > 50) {
        alert("Czas animacji nie może przekraczać 50 sekund!");
        return;
    }

    simulateMotion(initialVelocity, acceleration, time);
    calculateResults(initialVelocity, acceleration, time);
});

function simulateMotion(v0, a, t) {
    const totalDistance = v0 * t + 0.5 * a * Math.pow(t, 2);
    const scale = canvas.width / totalDistance;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ball = { x: canvas.width / 2, y: canvas.height - 50, radius: 10 };
    const groundY = canvas.height - 50;
    let elapsedTime = 0;

    // Definicja chmur
    const clouds = [];
    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: Math.random() * canvas.width, // Losowa pozycja na osi X
            y: Math.random() * 100, // Losowa pozycja na osi Y (wysokość chmur)
            speed: Math.random() * 0.3 + 0.1, // Losowa prędkość chmur
            width: Math.random() * 100 + 30, // Losowa szerokość
            height: Math.random() * 30 + 20 // Losowa wysokość
        });
    }

    function drawClouds() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // Chmura przesuwa się w lewo
            cloud.x += cloud.speed;
            if (cloud.x > canvas.width) cloud.x = -cloud.width; // Chmura wraca z lewej strony
        });
    }

    function drawBackground(offset) {
        // Tło
        ctx.fillStyle = '#89cff0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rysowanie chmur
        drawClouds();

        // Ziemia
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, groundY, canvas.width, 50);

        // Znaczniki odległości (0 m, połowa drogi, koniec drogi)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;

        const keyPositions = [0, totalDistance / 2, totalDistance];
        keyPositions.forEach(position => {
            const x = canvas.width / 2 + (position - offset) * scale; // Pozycja znacznika
            if (x >= 0 && x <= canvas.width) {
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x, groundY - 10);
                ctx.stroke();

                // Zwiększona czcionka na osi X
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 18px Arial';
                ctx.fillText(`${position.toFixed(1)} m`, x - 20, groundY - 15);
            }
        });
    }

    function drawBall(offset, elapsedTime) {
        // Obliczanie zmiennej wielkości kulki w zależności od czasu
        const maxRadius = 10; // Maksymalny rozmiar kulki
        const minRadius = 8; // Minimalny rozmiar kulki
        const ballRadius = maxRadius - Math.abs(Math.sin(elapsedTime * 0.5)) * (maxRadius - minRadius);

        // Rysowanie otoczki wokół kulki
        const glowColor = 'rgba(255, 0, 0, 0.6)'; // Czerwony blask wokół kulki
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius + 3, 0, Math.PI * 2); // Otoczka wokół kulki
        ctx.fillStyle = glowColor;
        ctx.fill();
        ctx.closePath();

        // Interpolacja koloru kulki (od niebieskiego do czerwonego w zależności od czasu)
        const colorInterpolation = Math.min(elapsedTime / t, 1); // Płynne przejście od 0 (niebieski) do 1 (czerwony)
        const red = Math.floor(colorInterpolation * 255);
        const green = Math.floor((1 - colorInterpolation) * 255);
        const ballColor = `rgb(${red}, ${green}, 255)`; // Niebieski do czerwony

        // Rysowanie kulki
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.closePath();
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (elapsedTime > t) {
            drawBackground(totalDistance);
            drawBall(totalDistance, elapsedTime);
            return;
        }

        // Obliczanie przebytej drogi i przesunięcia
        const distance = v0 * elapsedTime + 0.5 * a * Math.pow(elapsedTime, 2);

        // Dynamiczne przesunięcie
        drawBackground(distance);
        drawBall(distance, elapsedTime);

        // Wyświetlanie bieżących wartości
        document.getElementById('distance').textContent = `Przebyta droga: ${distance.toFixed(2)} m`;
        document.getElementById('finalVelocity').textContent = `Prędkość: ${(v0 + a * elapsedTime).toFixed(2)} m/s`;

        elapsedTime += 0.05;
        requestAnimationFrame(update);
    }

    update();
}

function calculateResults(v0, a, t) {
    const distance = v0 * t + 0.5 * a * Math.pow(t, 2);
    const finalVelocity = v0 + a * t;

    document.getElementById('distance').textContent = `Przebyta droga: ${distance.toFixed(2)} m`;
    document.getElementById('finalVelocity').textContent = `Prędkość końcowa: ${finalVelocity.toFixed(2)} m/s`;
}
