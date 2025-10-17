document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // inject styles for participants list (pretty)
  const style = document.createElement("style");
  style.textContent = `
    .participants { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e6e6e6; }
    .participants h5 { margin: 0 0 6px 0; font-size: 0.95rem; color: #333; }
    .participants-list { list-style: disc; margin: 8px 0 0 20px; padding: 0; }
    .participants-list li { margin-bottom: 6px; display: flex; align-items: center; color: #333; }
    .avatar { width: 28px; height: 28px; border-radius: 50%; background: #6c63ff; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; flex: 0 0 28px; }
    .participants-empty { font-style: italic; color: #666; }
    .participant-email { word-break: break-all; }
  `;
  document.head.appendChild(style);

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // card content now includes a participants container
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <h5>Participants</h5>
            <div class="participants-content"></div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // populate participants list (pretty)
        const participantsContainer = activityCard.querySelector(".participants-content");
        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            const initials = (p.match(/\b\w/g) || []).slice(0,2).join("").toUpperCase() || p.slice(0,2).toUpperCase();
            li.innerHTML = `<span class="avatar" aria-hidden="true">${initials}</span><span class="participant-email">${p}</span>`;
            ul.appendChild(li);
          });
          participantsContainer.appendChild(ul);
        } else {
          const empty = document.createElement("div");
          empty.className = "participants-empty";
          empty.textContent = "No participants yet";
          participantsContainer.appendChild(empty);
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
