console.log("structure.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburgerBtn");
  const rightPanel = document.getElementById("rightPanel");
  const closeBtn = document.getElementById("closePanel");
  const sections = document.querySelectorAll(".fade-section, .card");
  const finalImage = document.getElementById("finalImage");
  const introSection = document.getElementById("introSection");
  const projectNav = document.getElementById("projectNav");

  // --- Open / close the right-side panel ---
  if (hamburger && rightPanel) {
    hamburger.addEventListener("click", () => {
      rightPanel.classList.toggle("open");
      rightPanel.setAttribute(
        "aria-hidden",
        rightPanel.classList.contains("open") ? "false" : "true"
      );
    });
  }
  if (closeBtn && rightPanel) {
    closeBtn.addEventListener("click", () => {
      rightPanel.classList.remove("open");
      rightPanel.setAttribute("aria-hidden", "true");
    });
  }

  // --- Smooth appearance of sections when scrolled into view ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  sections.forEach((section) => observer.observe(section));

  // --- Common function for showing/hiding hamburger and top navigation ---
  function updateDynamicElementsVisibility() {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;
    const introHeight = introSection ? introSection.offsetHeight : viewportH;
    const showTrigger = introHeight * 0.8;

    let finalTopViewport = Infinity;
    if (finalImage) finalTopViewport = finalImage.getBoundingClientRect().top;

    const hideWhenFinalNearTopPx = 100;
    const shouldShow =
      scrollY > showTrigger && finalTopViewport > hideWhenFinalNearTopPx;

    if (hamburger) {
      shouldShow
        ? hamburger.classList.add("visible")
        : hamburger.classList.remove("visible");
    }

    if (projectNav) {
      shouldShow
        ? projectNav.classList.add("visible")
        : projectNav.classList.remove("visible");
    }
  }

  updateDynamicElementsVisibility();
  window.addEventListener("scroll", () =>
    requestAnimationFrame(updateDynamicElementsVisibility)
  );
  window.addEventListener("resize", updateDynamicElementsVisibility);
});


// === D3 VISUALIZATION ===
document.addEventListener("DOMContentLoaded", function () {
  const chartDiv = d3.select("#timeSpendChart");
  if (chartDiv.empty()) return;

  const width = chartDiv.node().clientWidth;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const svg = chartDiv
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.csv("/static/data/data_magnus_moves_website.csv").then((data) => {
    console.log("✅ CSV loaded:", data.slice(0, 5));

    data.forEach((d) => {
      d.TimeSpend = +d.TimeSpend;
    });

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.TimeSpend))
      .nice()
      .range([margin.left, width - margin.right]);

    const bins = d3
      .bin()
      .domain(x.domain())
      .thresholds(30)(data.map((d) => d.TimeSpend));

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d) => x(d.x0) + 1)
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => y(0) - y(d.length))
      .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("fill", "#4A6FA5");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  });
});



/* ================= CHESS + D3 ================= */


document.addEventListener("DOMContentLoaded", () => {
  console.log("Chess visualization DOM ready");
  console.log("D3 version:", d3.version);

  const boardImage = document.getElementById("boardImage");
  const timeSpentDiv = document.getElementById("timeSpent");
  const timePredDiv = document.getElementById("timePred");
  const whitePlayerDiv = document.getElementById("whitePlayer");
  const blackPlayerDiv = document.getElementById("blackPlayer");

  if (!boardImage) {
    console.warn("boardImage not found");
    return;
  }

  const csvPath = document.body.dataset.csv;
  console.log("CSV PATH:", csvPath);

  d3.csv(csvPath).then((data) => {
    console.log("CSV loaded:", data[0]);

    data.forEach(d => {
      d.ID_game = +d.ID_game;
      d.ID_move = +d.ID_move;
      d.PlayerSide = +d.PlayerSide;
      d.TimeSpend = +d.TimeSpend;
      d.TimeSpendPred = +d.TimeSpendPred;
    });

    let index = 0;

    function updatePlayers(gameId) {
      data
        .filter(d => d.ID_game === gameId)
        .forEach(d => {
          if (d.PlayerSide === 1)
            whitePlayerDiv.textContent = `White: ${d.PlayerName}`;
          if (d.PlayerSide === 0)
            blackPlayerDiv.textContent = `Black: ${d.PlayerName}`;
        });
    }

    function step() {
      if (index >= data.length) return;

      const move = data[index];

      // ✅ IMAGE (UTILISE ID_move)
      boardImage.src =
        `/static/boards/game_${move.ID_game}_move_${move.ID_move}.svg`;

      // ✅ TEXTE
      // Time spent (toujours affiché)
      timeSpentDiv.textContent = `${move.TimeSpend.toFixed(2)} s`;

      // Prediction uniquement pour Magnus (PlayerSide === 1)
      if (move.PlayerSide === 1 && !isNaN(move.TimeSpendPred)) {
        timePredDiv.textContent = `${move.TimeSpendPred.toFixed(2)} s`;
      } else {
        timePredDiv.textContent = "No prediction";
}


      // ✅ JOUEURS
      updatePlayers(move.ID_game);

      index++;
      setTimeout(step, 2000);
    }

    step();
  });
});
