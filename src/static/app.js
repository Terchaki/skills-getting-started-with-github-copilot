document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Carrega atividades, renderiza cards com lista de participantes e trata inscrições.
  async function fetchActivities() {
    const res = await fetch("/activities");
    if (!res.ok) throw new Error("Falha ao carregar atividades");
    return await res.json();
  }

  function createParticipantList(participants) {
    const ul = document.createElement("ul");
    ul.className = "participants-list";
    if (!participants || participants.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nenhum participante ainda.";
      ul.appendChild(li);
      return ul;
    }
    participants.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p;
      ul.appendChild(li);
    });
    return ul;
  }

  function renderActivities(activities) {
    const container = document.getElementById("activities-list");
    container.innerHTML = "";
    const select = document.getElementById("activity");

    // Limpa select (mantém primeira opção)
    select.querySelectorAll('option:not([value=""])').forEach((o) => o.remove());

    Object.entries(activities).forEach(([name, info]) => {
      // Card
      const card = document.createElement("div");
      card.className = "activity-card";

      const h4 = document.createElement("h4");
      h4.textContent = name;
      card.appendChild(h4);

      const pDesc = document.createElement("p");
      pDesc.textContent = info.description;
      card.appendChild(pDesc);

      const pSchedule = document.createElement("p");
      pSchedule.style.fontStyle = "italic";
      pSchedule.textContent = `Horário: ${info.schedule}`;
      card.appendChild(pSchedule);

      // Participants section
      const participantsWrapper = document.createElement("div");
      participantsWrapper.className = "participants";
      const ph = document.createElement("h5");
      const count = (info.participants && info.participants.length) || 0;
      ph.textContent = `Participantes (${count})`;
      participantsWrapper.appendChild(ph);
      participantsWrapper.appendChild(createParticipantList(info.participants));
      card.appendChild(participantsWrapper);

      container.appendChild(card);

      // Add option to select
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  }

  function showMessage(text, type = "info") {
    const msg = document.getElementById("message");
    msg.className = `message ${type}`;
    msg.textContent = text;
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 5000);
  }

  async function init() {
    try {
      const activities = await fetchActivities();
      renderActivities(activities);
    } catch (err) {
      const container = document.getElementById("activities-list");
      container.innerHTML = "<p>Erro ao carregar atividades.</p>";
      console.error(err);
    }

    // Form handling
    const form = document.getElementById("signup-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const activity = document.getElementById("activity").value;
      if (!email || !activity) {
        showMessage("Preencha email e escolha uma atividade.", "error");
        return;
      }

      try {
        const url = `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
          email
        )}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          showMessage(data.detail || "Erro ao inscrever.", "error");
          return;
        }
        showMessage(data.message || "Inscrição realizada com sucesso!", "success");

        // Atualiza UI localmente: busca atividades de novo e re-renderiza
        const activities = await fetchActivities();
        renderActivities(activities);
        form.reset();
      } catch (err) {
        console.error(err);
        showMessage("Erro de rede ao inscrever.", "error");
      }
    });
  }

  init();
});
