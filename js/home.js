// Homepage: live Discord numbers and the "Kopieren" button of the invite.
// The numbers come from this site's own /assets/data/discord.json
// (refreshed by GitHub Actions), so visitors never contact Discord. If the
// file can't be loaded, the numbers stay hidden. If the clipboard is not
// available (old browser, no permission), the invite link itself is shown
// so it can be copied by hand.
const NUMBER = new Intl.NumberFormat("de-DE");

async function loadDiscordStats() {
  const stats = document.getElementById("dc-stats");
  if (!stats) return;
  try {
    const res = await fetch("/assets/data/discord.json", { cache: "no-cache" });
    if (!res.ok) return;
    const data = await res.json();
    if (!Number.isFinite(data.members)) return;
    document.getElementById("dc-members").textContent = NUMBER.format(data.members);
    const online = document.getElementById("dc-online");
    if (Number.isFinite(data.online)) online.textContent = NUMBER.format(data.online);
    else online.parentElement.hidden = true;
    stats.hidden = false;
  } catch {}
}

function initInviteCopy() {
  const btn = document.getElementById("discord-copy");
  const ok = document.getElementById("discord-copy-ok");
  if (!btn || !ok) return;
  const label = btn.querySelector(".dc-copy-label");
  let resetTimer;

  btn.addEventListener("click", async () => {
    const invite = btn.dataset.invite;
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(invite);
      ok.classList.remove("is-link");
      ok.textContent = "Einladung kopiert. Schick sie weiter!";
      btn.classList.add("is-copied");
      if (label) label.textContent = "Kopiert";
      resetTimer = setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = "Kopieren";
        ok.textContent = "";
      }, 3000);
    } catch {
      ok.classList.add("is-link");
      ok.textContent = invite;
    }
  });
}

loadDiscordStats();
initInviteCopy();
