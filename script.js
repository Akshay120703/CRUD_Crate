let items = JSON.parse(localStorage.getItem("items") || "[]");
let currentType = "file";
let currentFolderId = null;

function saveItems() {
  localStorage.setItem("items", JSON.stringify(items));
}

function openCreateModal(type) {
  currentType = type;
  currentFolderId = null;
  document.getElementById("modal-title").innerText = `Create ${type}`;
  document.getElementById("item-name").value = "";
  document.getElementById("item-content").value = "";
  document.getElementById("modal").classList.remove("hidden");
}

function openFolderCreateModal(type) {
  currentType = type;
  document.getElementById("modal-title").innerText = `Create ${type} in Folder`;
  document.getElementById("item-name").value = "";
  document.getElementById("item-content").value = "";
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function createItem() {
  const name = document.getElementById("item-name").value;
  const content = document.getElementById("item-content").value;

  let contentType = "text";
  if (currentType === "container") {
    if (content.match(/\.(jpg|png|gif)$/)) contentType = "image";
    else if (content.match(/\.(mp4)$/)) contentType = "video";
    else if (content.match(/\.(mp3)$/)) contentType = "audio";
    else if (content.startsWith("http")) contentType = "url";
  }

  const newItem = {
    id: Date.now(),
    type: currentType,
    name,
    content,
    contentType,
    parentId: currentFolderId,
  };

  items.push(newItem);
  saveItems();
  renderItems();
  closeModal();
}

function deleteItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  renderItems();
}

function renderItems(folderId = null, target = document.getElementById("content")) {
  target.innerHTML = "";
  const filteredItems = items.filter((item) => item.parentId === folderId);

  filteredItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.innerText = `${item.type.toUpperCase()}: ${item.name}`;
    card.appendChild(title);

    if (item.type === "file") {
      const textarea = document.createElement("textarea");
      textarea.value = item.content;
      textarea.oninput = (e) => {
        item.content = e.target.value;
        saveItems();
      };
      card.appendChild(textarea);
    } else if (item.type === "folder") {
      const folderBtn = document.createElement("button");
      folderBtn.innerText = "Open Folder";
      folderBtn.onclick = () => openFolder(item.id, item.name);
      card.appendChild(folderBtn);
    } else if (item.type === "container") {
      if (item.contentType === "image") {
        const img = document.createElement("img");
        img.src = item.content;
        card.appendChild(img);
      } else if (item.contentType === "video") {
        const video = document.createElement("video");
        video.src = item.content;
        video.controls = true;
        card.appendChild(video);
      } else if (item.contentType === "audio") {
        const audio = document.createElement("audio");
        audio.src = item.content;
        audio.controls = true;
        card.appendChild(audio);
      } else if (item.contentType === "url") {
        const linkDiv = document.createElement("div");
        linkDiv.className = "link-box";
        linkDiv.innerText = "Open Link";
        linkDiv.onclick = () => window.open(item.content, "_blank");
        card.appendChild(linkDiv);
      }
    }

    const delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.onclick = () => deleteItem(item.id);
    card.appendChild(delBtn);

    target.appendChild(card);
  });
}

function openFolder(folderId, folderName) {
  currentFolderId = folderId;
  document.getElementById("folder-title").innerText = `Folder: ${folderName}`;
  document.getElementById("folder-view").classList.remove("hidden");
  renderItems(folderId, document.getElementById("folder-items"));
}

function closeFolder() {
  document.getElementById("folder-view").classList.add("hidden");
  currentFolderId = null;
  renderItems();
}

// Initial render
renderItems();
