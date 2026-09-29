const API_URL = 'https://mystikaboutique.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  cargarDisfraces();

  // Sidebar Móvil Toggle
  const toggleBtn = document.getElementById('toggle-sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('active');
    });
  }

  // Guardar Nuevo Disfraz
  const formNuevo = document.getElementById('form-nuevo-disfraz');
  if (formNuevo) {
    formNuevo.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Limpiar puntos del campo precio por si ingresaron 75.000
    let precio = formData.get('precioAlquiler');
    if (precio) {
      formData.set('precioAlquiler', precio.toString().replace(/\./g, ''));
    }
    try{
      const res = await fetch(`${API_URL}/disfraces`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        cancelarAgregarDisfraz(); // Limpia formulario, imagen y cierra modal
        cargarDisfraces();
      } else {
        const errData = await res.json();
        alert(`Error al guardar: ${errData.error || 'Verifica la consola'}`);
      }
    } catch (err) {
      alert('No se pudo conectar con el servidor backend en http://localhost:3000');
    }
    });
  }

  // Procesar Alquiler
  const formAlquilar = document.getElementById('form-alquilar');
  if (formAlquilar) {
    formAlquilar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        disfrazId: document.getElementById('alquiler-disfraz-id').value,
        cedulaCliente: document.getElementById('alq-cedula').value,
        nombreCliente: document.getElementById('alq-nombre').value,
        telefonoCliente: document.getElementById('alq-telefono').value,
        fechaDevolucionProgramada: document.getElementById('alq-fecha-dev').value,
        pin: document.getElementById('alq-pin').value
      };

      const res = await fetch(`${API_URL}/alquileres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Alquiler completado exitosamente!');
        closeModal('modal-alquilar');
        e.target.reset();
        cargarDisfraces();
      } else {
        alert(`Error: ${data.error}`);
      }
    });
  }

  // Previsualización de la imagen seleccionada
  const inputImagen = document.getElementById('input-imagen-disfraz');
  if (inputImagen) {
    inputImagen.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previewImg = document.getElementById('preview-imagen');
          const previewContainer = document.getElementById('container-preview-imagen');
          if (previewImg && previewContainer) {
            previewImg.src = event.target.result;
            previewContainer.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

async function cargarDisfraces() {
  const res = await fetch(`${API_URL}/disfraces`);
  const disfraces = await res.json();
  const grid = document.getElementById('costumes-grid');
  if (!grid) return;
  grid.innerHTML = '';

  disfraces.forEach(item => {
    const isAvailable = item.stockDisponible > 0;
    grid.innerHTML += `
      <div class="card">
        <img src="${item.imagenUrl}" class="card-img" alt="${item.nombre}">
        <div class="card-body">
          <div>
            <div class="card-title">${item.nombre}</div>
            <div class="card-info">Categoría: ${item.categoria} | Talla: ${item.talla}</div>
            <div class="card-info"><strong>Precio:</strong> $${item.precioAlquiler.toLocaleString()}</div>
            <span class="stock-badge ${isAvailable ? 'available' : 'empty'}">
              Stock: ${item.stockDisponible} / ${item.stockTotal}
            </span>
          </div>
          <div style="margin-top: 15px;">
            <button class="btn btn-success" style="width:100%" 
              ${!isAvailable ? 'disabled' : ''} 
              onclick="abrirModalAlquilar('${item._id}')">
              ${isAvailable ? 'Alquilar Disfraz' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function abrirModalAlquilar(disfrazId) {
  document.getElementById('alquiler-disfraz-id').value = disfrazId;
  openModal('modal-alquilar');
}

async function cargarAlquileres() {
  const cedulaInput = document.getElementById('search-cedula');
  const cedula = cedulaInput ? cedulaInput.value : '';
  const url = cedula ? `${API_URL}/alquileres?cedula=${cedula}` : `${API_URL}/alquileres`;
  
  const res = await fetch(url);
  const alquileres = await res.json();
  const tbody = document.getElementById('alquileres-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  alquileres.forEach(a => {
    const fechaFormat = new Date(a.fechaDevolucionProgramada).toLocaleDateString('es-CO');
    tbody.innerHTML += `
      <tr>
        <td><strong>${a.cedulaCliente}</strong></td>
        <td>${a.nombreCliente}</td>
        <td>${a.telefonoCliente}</td>
        <td>${a.disfrazId ? a.disfrazId.nombre : 'N/A'}</td>
        <td>${fechaFormat}</td>
        <td><span class="stock-badge available">${a.estado}</span></td>
      </tr>
    `;
  });
}

function switchSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
  
  if (section === 'catalogo') {
    document.getElementById('sec-catalogo').classList.add('active');
    document.getElementById('section-title').textContent = 'Catálogo de Disfraces';
    cargarDisfraces();
  } else {
    document.getElementById('sec-alquileres').classList.add('active');
    document.getElementById('section-title').textContent = 'Historial de Alquileres';
    cargarAlquileres();
  }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Función para eliminar solo la imagen seleccionada
function quitarImagenCargada() {
  const inputImagen = document.getElementById('input-imagen-disfraz');
  const previewImg = document.getElementById('preview-imagen');
  const previewContainer = document.getElementById('container-preview-imagen');

  if (inputImagen) inputImagen.value = '';
  if (previewImg) previewImg.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
}

// Función para resetear todo el formulario y cerrar el modal al cancelar
function cancelarAgregarDisfraz() {
  const form = document.getElementById('form-nuevo-disfraz');
  if (form) form.reset();
  quitarImagenCargada();
  closeModal('modal-nuevo-disfraz');
}