let books = JSON.parse(localStorage.books || "null") || [
  {
    title:"Senja di Antara Kita",
    author:"Rana Putri",
    type:"Fiksi",
    price:42000,
    progress:68,
    desc:"Fragmen tentang pulang dan percakapan yang tertunda."
  },
  {
    title:"Atlas Ruang Sunyi",
    author:"Damar Aksara",
    type:"Esai",
    price:35000,
    progress:24,
    desc:"Esai visual tentang menemukan jeda di kota yang berisik."
  },
  {
    title:"Orbit yang Hilang",
    author:"Nara Wisesa",
    type:"Sci-fi",
    price:50000,
    progress:0,
    desc:"Ekspedisi mencari rumah kedua di luar bumi."
  }
];

let saldo = Number(localStorage.saldo || 248500);
let aktif = null;
let animasi = true;

const rp = n => new Intl.NumberFormat("id-ID", {
  style:"currency",
  currency:"IDR",
  maximumFractionDigits:0
}).format(n);

function save() {
  localStorage.books = JSON.stringify(books);
  localStorage.saldo = saldo;
}

function page(id) {
  document.querySelectorAll(".page")
    .forEach(x => x.classList.add("hide"));

  document.getElementById(id).classList.remove("hide");
  render();
}

function theme() {
  document.body.classList.toggle("dark");
  localStorage.dark = document.body.classList.contains("dark");
}

if (localStorage.dark === "true") {
  document.body.classList.add("dark");
}

function render() {
  document.getElementById("saldo").textContent = rp(saldo);
  document.getElementById("balance").textContent = rp(saldo);

  const key = (document.getElementById("search").value || "")
    .toLowerCase();

  const list = books.filter(b =>
    `${b.title} ${b.author} ${b.type}`
      .toLowerCase()
      .includes(key)
  );

  const html = list.map(book => {
    const index = books.indexOf(book);

    return `
      <article class="book" onclick="readBook(${index})">
        <div class="cover">${book.title[0]}</div>
        <small>${book.type}</small>
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <p>${book.progress ? book.progress + "% dibaca" : rp(book.price)}</p>
        <div class="progress">
          <i style="width:${book.progress}%"></i>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("books").innerHTML = html;
  document.getElementById("libraryBooks").innerHTML = html;
}

function readBook(index) {
  aktif = books[index];

  document.getElementById("readerTitle").textContent = aktif.title;
  document.getElementById("readerType").textContent = aktif.type;
  document.getElementById("readerDesc").textContent = aktif.desc;
  document.getElementById("progress").value = aktif.progress;
  document.getElementById("progressText").textContent =
    aktif.progress + "%";

  document.getElementById("reader").classList.remove("hide");
}

function closeReader() {
  document.getElementById("reader").classList.add("hide");
}

function saveProgress(value) {
  if (!aktif) return;

  aktif.progress = Number(value);
  document.getElementById("progressText").textContent = value + "%";
  save();
}

function upload() {
  const title = document.getElementById("title").value || "Karya baru";
  const author = document.getElementById("author").value || "Kreator";
  const price = Number(document.getElementById("price").value || 0);
  const desc = document.getElementById("desc").value || "Karya digital baru.";

  books.unshift({
    title,
    author,
    price,
    desc,
    type:"Karya kreator",
    progress:0
  });

  save();
  alert("Karya berhasil disimpan.");
  page("library");
}

function topUp() {
  const value = Number(document.getElementById("topup").value);

  if (value < 10000) {
    alert("Minimal top up Rp10.000");
    return;
  }

  saldo += value;
  save();
  alert("Saldo berhasil ditambahkan.");
  render();
}

function pdf() {
  const files = document.getElementById("scan").files;

  if (!files.length) {
    alert("Pilih gambar halaman terlebih dahulu.");
    return;
  }

  document.getElementById("scanInfo").textContent =
    `${files.length} halaman siap diproses.`;

  const win = window.open("");

  win.document.write(`
    <title>BukuRuang PDF</title>
    <style>
      img {
        display:block;
        width:100%;
        page-break-after:always;
      }
    </style>
  `);

  [...files].forEach(file => {
    const img = win.document.createElement("img");
    img.src = URL.createObjectURL(file);
    win.document.body.appendChild(img);
  });

  win.document.write("<script>onload=()=>print()<\/script>");
}

function motion() {
  animasi = !animasi;

  document.querySelector(".cube").style.animationPlayState =
    animasi ? "running" : "paused";
}

render();
