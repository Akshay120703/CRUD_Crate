// Helper to get DOM element
function $(id) {
  return document.getElementById(id);
}

// Render a single item (folder, file, link)
function renderItem(item, container) {
  const card = document.createElement("div");
  card.className = "card";

  // Delete button
  const del = document.createElement("button");
  del.innerText = "🗑";
  del.className = "delete-btn";
  del.onclick = (e) => {
    e.stopPropagation();
    deleteItem(item.id, () => {
      loadItems(getParent());
    });
  };
  card.appendChild(del);

  // Folder
  if (item.type === "folder") {
    const title = document.createElement("h3");
    title.innerText = item.data.name;
    const icon = document.createElement("p");
    icon.innerText = "📁 Folder";

    card.appendChild(title);
    card.appendChild(icon);

    card.onclick = () => {
      window.location.href = `folder.html?folderId=${item.id}`;
    };
  }

  // File
  if (item.type === "file") {
    const title = document.createElement("h4");
    title.innerText = `📝 ${item.data.name}`;
    card.appendChild(title);

    card.onclick = () => openFileModal(item);
  }

  // Link
  if (item.type === "link") {
    const title = document.createElement("h4");
    title.innerText = item.data.title || item.data.url;
    card.appendChild(title);

    card.onclick = () => {
      window.open(item.data.url, '_blank');
    };
  }

  container.appendChild(card);
}

// Load items for current view
function loadItems(parent = null) {
  getAllItems(items => {
    const area = $("content-area");
    area.innerHTML = "";
    items.forEach(item => renderItem(item, area));
  }, parent);
}

// Create new folder
function createFolder() {
  const name = prompt("Folder name?");
  if (name) {
    const parent = getParent();
    addItem("folder", { name }, parent);
    setTimeout(() => loadItems(parent), 300);
  }
}

// Create new file
function createFile() {
  const name = prompt("File name?");
  if (name) {
    const parent = getParent();
    addItem("file", { name, content: "" }, parent);
    setTimeout(() => loadItems(parent), 300);
  }
}

// Create new link
function createLink() {
  const url = prompt("Paste link:");
  if (!url) return;

  const validUrl = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : "https://" + url;

  const title = prompt("Enter title for the link (optional):");

  const parent = getParent();
  addItem("link", { url: validUrl, title }, parent);
  setTimeout(() => loadItems(parent), 300);
}

// File editor logic
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

// Close modal
$("close-file-modal").onclick = () => {
  $("file-modal").style.display = "none";
};

// Determine parent folder
function getParent() {
  const url = new URL(window.location.href);
  return url.pathname.includes("folder.html")
    ? parseInt(url.searchParams.get("folderId"))
    : null;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  openDB(() => loadItems(getParent()));
});
