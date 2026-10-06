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
let reviews = JSON.parse(localStorage.reviews || "{}");
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
  localStorage.reviews = JSON.stringify(reviews);
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
  const saldoEl = document.getElementById("saldo");
  const balanceEl = document.getElementById("balance");
  const searchEl = document.getElementById("search");

  if (saldoEl) saldoEl.textContent = rp(saldo);
  if (balanceEl) balanceEl.textContent = rp(saldo);

  const key = (searchEl?.value || "").toLowerCase();

  const list = books.filter(book =>
    `${book.title} ${book.author} ${book.type}`
      .toLowerCase()
      .includes(key)
  );

  const html = list.map(book => {
    const index = books.indexOf(book);

    return `
      <article class="book" onclick="readBook(${index})">
        <div class="cover">${safe(book.title[0])}</div>
        <small>${safe(book.type)}</small>
        <h3>${safe(book.title)}</h3>
        <p>${safe(book.author)}</p>
        <p>${book.progress ? book.progress + "% dibaca" : rp(book.price)}</p>
        <div class="progress">
          <i style="width:${book.progress}%"></i>
        </div>
      </article>
    `;
  }).join("");

  const booksEl = document.getElementById("books");
  const libraryEl = document.getElementById("libraryBooks");

  if (booksEl) booksEl.innerHTML = html;
  if (libraryEl) libraryEl.innerHTML = html;
}

function readBook(index) {
  aktif = books[index];

  document.getElementById("readerTitle").textContent = aktif.title;
  document.getElementById("readerType").textContent = aktif.type;
  document.getElementById("readerDesc").textContent = aktif.desc;
  document.getElementById("progress").value = aktif.progress;
  document.getElementById("progressText").textContent =
    aktif.progress + "%";

  renderReviews();

  document.getElementById("reader").classList.remove("hide");
}

function closeReader() {
  document.getElementById("reader").classList.add("hide");
}

function saveProgress(value) {
  if (!aktif) return;

  aktif.progress = Number(value);
  document.getElementById("progressText").textContent =
    value + "%";

  save();
  render();
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

  if (!value || value < 10000) {
    alert("Minimal top up Rp10.000.");
    return;
  }

  saldo += value;
  save();

  document.getElementById("topup").value = "";
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

  if (!win) {
    alert("Izinkan pop-up browser terlebih dahulu.");
    return;
  }

  win.document.write(`
    <!doctype html>
    <html>
    <head>
      <title>BukuRuang PDF</title>
      <style>
        body { margin:0; }
        img {
          display:block;
          width:100%;
          page-break-after:always;
        }
      </style>
    </head>
    <body></body>
    </html>
  `);

  const body = win.document.body;

  [...files].forEach(file => {
    const image = win.document.createElement("img");
    image.src = URL.createObjectURL(file);
    body.appendChild(image);
  });

  win.document.close();
  win.onload = () => win.print();
}

function motion() {
  animasi = !animasi;

  document.querySelector(".cube").style.animationPlayState =
    animasi ? "running" : "paused";
}

function safe(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[char]));
}

function renderReviews() {
  if (!aktif) return;

  const list = reviews[aktif.title] || [];
  const box = document.getElementById("reviewsList");

  if (!list.length) {
    box.innerHTML = `
      <p class="empty-review">
        Belum ada ulasan. Jadilah pembaca pertama.
      </p>
    `;
    return;
  }

  box.innerHTML = list.map(item => `
    <div class="review">
      <strong>
        ${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}
      </strong>
      <p>${safe(item.comment)}</p>
      <small>${safe(item.date)}</small>
    </div>
  `).join("");
}

function addReview() {
  if (!aktif) return;

  const rating = Number(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value.trim();

  if (!comment) {
    alert("Tulis komentar terlebih dahulu.");
    return;
  }

  if (!reviews[aktif.title]) {
    reviews[aktif.title] = [];
  }

  reviews[aktif.title].unshift({
    rating,
    comment,
    date:new Date().toLocaleDateString("id-ID")
  });

  document.getElementById("comment").value = "";

  save();
  renderReviews();
  alert("Ulasan berhasil dikirim.");
}

render();
