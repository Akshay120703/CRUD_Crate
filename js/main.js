function $(id) {
  return document.getElementById(id);
}

function renderItem(item, container) {
  const card = document.createElement("div");
  card.className = "card";

  const del = document.createElement("button");
  del.innerText = "🗑";
  del.className = "delete-btn";
  del.onclick = (e) => {
    e.stopPropagation();
    deleteItem(item.id, () => location.reload());
  };
  card.appendChild(del);

  if (item.type === "folder") {
    card.innerHTML += `<h3>${item.data.name}</h3><p>📁 Folder</p>`;
    card.onclick = () => {
      window.location.href = `folder.html?folderId=${item.id}`;
    };
  }

  if (item.type === "file") {
    card.innerHTML += `<h4>📝 ${item.data.name}</h4>`;
    card.onclick = () => openFileModal(item);
  }

  if (item.type === "link") {
    card.innerHTML += `
      <h4>${item.data.title || "Website"}</h4>
      ${item.data.image ? `<img src="${item.data.image}" />` : ""}
      <a href="${item.data.url}" target="_blank">${item.data.url}</a>
    `;
  }

  container.appendChild(card);
}

function loadItems(parent = null) {
  getAllItems(items => {
    const area = $("content-area");
    area.innerHTML = "";
    items.forEach(item => renderItem(item, area));
  }, parent);
}

function createFolder() {
  const name = prompt("Folder name?");
  if (name) {
    const parent = getParent();
    addItem("folder", { name }, parent);
    setTimeout(() => loadItems(parent), 300);
  }
}

function createFile() {
  const name = prompt("File name?");
  if (name) {
    const parent = getParent();
    addItem("file", { name, content: "" }, parent);
    setTimeout(() => loadItems(parent), 300);
  }
}

function createLink() {
  const url = prompt("Paste link:");
  if (!url) return;
  fetch(`https://api.linkpreview.net/?key=YOUR_API_KEY&q=${url}`)
    .then(res => res.json())
    .then(data => {
      const preview = {
        url: data.url,
        title: data.title,
        image: data.image,
        description: data.description
      };
      const parent = getParent();
      addItem("link", preview, parent);
      setTimeout(() => loadItems(parent), 500);
    })
    .catch(() => {
      const parent = getParent();
      addItem("link", { url }, parent);
      setTimeout(() => loadItems(parent), 300);
    });
}

let currentFileId = null;

function openFileModal(item) {
  $("file-modal").style.display = "block";
  $("file-editor").value = item.data.content;
  currentFileId = item.id;

  $("file-editor").oninput = () => {
    updateItem(currentFileId, {
      name: item.data.name,
      content: $("file-editor").value
    });
  };
}

$("close-file-modal").onclick = () => {
  $("file-modal").style.display = "none";
};

function getParent() {
  const url = new URL(window.location.href);
  return url.pathname.includes("folder.html")
    ? parseInt(url.searchParams.get("folderId"))
    : null;
}

document.addEventListener("DOMContentLoaded", () => {
  openDB(() => loadItems(getParent()));
});
