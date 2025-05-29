let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    currentPdfUrl = null;

const scale = 1.5;
const canvas = document.getElementById('pdf-render');
const ctx = canvas.getContext('2d');

// Render the page
function renderPage(num) {
    pageIsRendering = true;
    const baseTitle = document.getElementById('cvModalLabel').dataset.baseTitle || 'PDF Viewer';
    document.getElementById('cvModalLabel').textContent = `${baseTitle} (Page ${num} of ${pdfDoc.numPages})`;

    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({
            scale
        });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
    });

    document.getElementById('cvModalLabel').textContent = `Page ${num} of ${pdfDoc.numPages}`;
}

function queueRenderPage(num) {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

function showPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function showNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

document.getElementById('prevPage').addEventListener('click', showPrevPage);
document.getElementById('nextPage').addEventListener('click', showNextPage);

document.querySelectorAll('.open-pdf-modal').forEach(trigger => {
    trigger.addEventListener('click', function () {
        const url = this.getAttribute('data-pdf');
        const title = this.getAttribute('data-title') || 'PDF Viewer';

        // Update modal title
        const label = document.getElementById('cvModalLabel');
        label.dataset.baseTitle = title;
        label.textContent = title;

        // Update download link dynamically
        const downloadBtn = document.getElementById('modalDownloadBtn');
        downloadBtn.setAttribute('href', url);

        // Load the selected PDF
        pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            pageNum = 1;
            renderPage(pageNum); // ✅ Ensure rendering only starts after load
        }).catch(err => {
            console.error('Error loading PDF:', err);
        });
    });
});
