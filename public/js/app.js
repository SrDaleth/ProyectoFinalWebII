const API_URL = 'https://mystikaboutique.onrender.com/api';

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


// 1. Abrir modal para eliminar un único disfraz
function abrirModalEliminar(id) {
  document.getElementById('eliminar-disfraz-id').value = id;
  openModal('modal-eliminar-disfraz');
}

// 2. Event listener para procesar la eliminación con PIN
document.getElementById('form-eliminar-disfraz').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('eliminar-disfraz-id').value;
  const pin = document.getElementById('eliminar-pin').value;

  const res = await fetch(`${API_URL}/disfraces/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });

  if (res.ok) {
    closeModal('modal-eliminar-disfraz');
    cargarDisfraces();
  } else {
    const data = await res.json();
    alert(`Error: ${data.error}`);
  }
});

//funcion para cargar Disfraces
async function cargarDisfraces() {
  const res = await fetch(`${API_URL}/disfraces`);
  const disfraces = await res.json();
  const grid = document.getElementById('costumes-grid');
  if (!grid) return;
  grid.innerHTML = '';

  disfraces.forEach(item => {
    const isAvailable = item.stockDisponible > 0;
    grid.innerHTML += `
      <div class="card" style="position: relative;">
        <!-- Botón de Descuento (Esquina superior izquierda) -->
        <button class="btn" onclick="abrirModalPrecio('${item._id}', ${item.precioAlquiler})" 
          style="position: absolute; top: 10px; left: 10px; background: rgba(108,92,231,0.8); color: white; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; z-index: 10;">
          🏷️ Descuento
        </button>

        <!-- Botón de Eliminar (Esquina superior derecha) -->
        <button class="btn" onclick="abrirModalEliminar('${item._id}')" 
          style="position: absolute; top: 10px; right: 10px; background: rgba(255,118,117,0.8); color: white; padding: 5px 10px; border-radius: 50%; z-index: 10;">
          <i class="fa-solid fa-trash"></i>
        </button>

        <img src="${item.imagenUrl}" class="card-img" alt="${item.nombre}">
        <div class="card-body">
          <div>
            <div class="card-title">${item.nombre}</div>
            <div class="card-info">Categoría: ${item.categoria} | Talla: ${item.talla}</div>
            <div class="card-info"><strong>Precio:</strong> $${item.precioAlquiler.toLocaleString('es-CO')}</div>
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
    const fAlquiler = formatearFechaLocal(a.fechaAlquiler || a.createdAt);
    const fDevolucion = formatearFechaLocal(a.fechaDevolucionProgramada);
    const isActivo = a.estado === 'ACTIVO';

    tbody.innerHTML += `
      <tr>
        <td><strong>${a.cedulaCliente}</strong></td>
        <td>${a.nombreCliente}</td>
        <td>${a.disfrazId ? a.disfrazId.nombre : 'N/A'}</td>
        <td>${fAlquiler}</td>
        <td>${fDevolucion}</td>
        <td><span class="stock-badge ${isActivo ? 'empty' : 'available'}">${a.estado}</span></td>
        <td>
          ${isActivo ? `
            <button class="btn btn-success" style="font-size: 0.8rem; padding: 4px 8px;" onclick="devolverDisfraz('${a._id}')">
              ↩️ Devolver
            </button>
          ` : '—'}
        </td>
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

// 1. Solución de Fecha de Devolución exacta (evita mostrar el día anterior por zona horaria UTC)
function formatearFechaLocal(fechaIso) {
  if (!fechaIso) return 'N/A';
  const dateObj = new Date(fechaIso);
  // Usar getUTCDate() / getUTCMonth() si se guardó como ISO String YYYY-MM-DD
  const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
  const fechaAjustada = new Date(dateObj.getTime() + userTimezoneOffset);
  return fechaAjustada.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

async function devolverDisfraz(alquilerId) {
  const pin = prompt('Ingresa el PIN de seguridad para confirmar la devolución:');
  if (!pin) return;

  const res = await fetch(`${API_URL}/alquileres/${alquilerId}/devolver`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Disfraz devuelto con éxito');
    cargarAlquileres();
  } else {
    alert(`Error: ${data.error}`);
  }
}

// 4. Cambiar Precio / Descuento
function abrirModalPrecio(disfrazId, precioActual) {
  document.getElementById('precio-disfraz-id').value = disfrazId;
  document.getElementById('nuevo-precio-val').value = precioActual;
  openModal('modal-cambiar-precio');
}

document.getElementById('form-cambiar-precio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('precio-disfraz-id').value;
  const precioAlquiler = document.getElementById('nuevo-precio-val').value;
  const pin = document.getElementById('precio-pin').value;

  const res = await fetch(`${API_URL}/disfraces/${id}/precio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precioAlquiler, pin })
  });

  if (res.ok) {
    closeModal('modal-cambiar-precio');
    cargarDisfraces();
  } else {
    const data = await res.json();
    alert(`Error: ${data.error}`);
  }
});


// 5. Vaciar Inventario Completo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
document.getElementById('form-vaciar-todo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pin = document.getElementById('vaciar-pin').value;

  const res = await fetch(`${API_URL}/disfraces/vaciar/todo`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });

  if (res.ok) {
    alert('Inventario y alquileres eliminados por completo.');
    closeModal('modal-vaciar-todo');
    cargarDisfraces();
  } else {
    const data = await res.json();
    alert(`Error: ${data.error}`);
  }
});

// 6. Cargar Métricas Diarias
async function cargarMetricas() {
  const res = await fetch(`${API_URL}/alquileres`);
  const alquileres = await res.json();

  const hoyStr = new Date().toISOString().split('T')[0];
  let totalHoy = 0;
  let acumuladoTotal = 0;

  alquileres.forEach(a => {
    const precio = a.disfrazId ? a.disfrazId.precioAlquiler : 0;
    acumuladoTotal += precio;

    const fechaAlqStr = new Date(a.fechaAlquiler || a.createdAt).toISOString().split('T')[0];
    if (fechaAlqStr === hoyStr) {
      totalHoy += precio;
    }
  });

  document.getElementById('ingresos-hoy').textContent = `$${totalHoy.toLocaleString('es-CO')}`;
  document.getElementById('ingresos-totales').textContent = `$${acumuladoTotal.toLocaleString('es-CO')}`;
}

// 7. Navegación entre Pestañas
function switchSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));

  if (section === 'catalogo') {
    document.getElementById('sec-catalogo').classList.add('active');
    document.getElementById('section-title').textContent = 'Catálogo de Disfraces';
    cargarDisfraces();
  } else if (section === 'alquileres') {
    document.getElementById('sec-alquileres').classList.add('active');
    document.getElementById('section-title').textContent = 'Historial de Alquileres';
    cargarAlquileres();
  } else if (section === 'metricas') {
    document.getElementById('sec-metricas').classList.add('active');
    document.getElementById('section-title').textContent = 'Métricas y Conteo Diario';
    cargarMetricas();
  }
}