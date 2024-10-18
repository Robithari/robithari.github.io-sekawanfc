// Import Firebase Firestore
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Ambil slug dari URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// Fungsi untuk menghapus tag HTML dari string
function stripHtml(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Fungsi untuk memperbarui elemen jika ditemukan
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = text;
    } else {
        console.warn(`Element with ID "${id}" not found.`);
    }
}

function updateElementSrc(id, src, alt = "") {
    const element = document.getElementById(id);
    if (element) {
        element.src = src;
        element.alt = alt;
    } else {
        console.warn(`Element with ID "${id}" not found.`);
    }
}

// Fungsi untuk menampilkan konten utama setelah data dimuat
function showMainContent() {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
        mainContent.style.display = "block";
    } else {
        console.warn('Element with ID "main-content" not found.');
    }
}

// Fungsi untuk memuat artikel berdasarkan slug
async function loadArticle() {
    if (!slug) {
        document.body.innerHTML = "<h1>Maaf Halaman Yang Anda Tuju Salah</h1>";
        return;
    }

    try {
        console.log("Memulai pemuatan artikel...");

        // Buat query untuk mengambil artikel berdasarkan slug
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        // Cek apakah artikel ditemukan
        if (!querySnapshot.empty) {
            const article = querySnapshot.docs[0].data();

            // Tampilkan data artikel ke elemen HTML
            updateElementText("title", article.title);
            updateElementText("titleKeterangan", article.titleKeterangan);
            updateElementText(
                "tanggalPembuatan",
                new Date(article.tanggalPembuatan).toLocaleDateString('id-ID')
            );
            updateElementSrc("photoUrl", article.photoUrl, article.caption);
            updateElementText("caption", article.caption);

            const articlesContainer = document.getElementById("articles");
            if (articlesContainer) {
                articlesContainer.innerHTML = article.content;
            } else {
                console.warn('Element with ID "articles" not found.');
            }

            // Memperbarui <title> halaman dan meta tag untuk link preview
            document.title = article.title;
            document.querySelector('meta[property="og:title"]').setAttribute('content', article.title);

            const plainTextContent = stripHtml(article.content);
            const firstSentence = plainTextContent.split('. ')[0].trim() + '.';
            document.querySelector('meta[property="og:description"]').setAttribute('content', firstSentence);
            document.querySelector('meta[property="og:image"]').setAttribute('content', article.photoUrl);

            console.log("Artikel berhasil dimuat:", article);

            // Tampilkan konten utama setelah data berhasil dimuat
            showMainContent();

            // Tandai bahwa halaman siap di-render oleh bot
            window.prerenderReady = true;
        } else {
            document.body.innerHTML = "<h1>Artikel tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        document.body.innerHTML = "<h1>Terjadi kesalahan saat memuat artikel.</h1>";
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    console.log("Halaman dimuat. Memulai pemrosesan artikel...");
    
    // Sembunyikan konten utama saat loading
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
        mainContent.style.display = "none";
    } else {
        console.warn('Element with ID "main-content" not found saat menyembunyikan konten.');
    }

    // Panggil fungsi untuk memuat artikel
    loadArticle();
});
