async function cargarDatos() {
  const response = await fetch('travel_recommendation_api.json');
  const data = await response.json();
  return data;
}

async function obtenerHoraPorZona(zona) {
  try {
    const res = await fetch(`https://worldtimeapi.org/api/timezone/${zona}`);
    const data = await res.json();
    return new Date(data.datetime).toLocaleTimeString();
  } catch (error) {
    return 'Hora no disponible';
  }
}

async function mostrarResultados(destinos) {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = '';

  for (const destino of destinos) {
    const card = document.createElement('div');
    card.classList.add('card');

    let time = '';
    if (destino.timeZone) {
      const hora = await obtenerHoraPorZona(destino.timeZone);
      time = `<p><strong>Hora local:</strong> ${hora}</p>`;
    }

    card.innerHTML = `
      <img src="${destino.imageUrl}" alt="${destino.name}">
      <div class="card-body">
        <h3>${destino.name}</h3>
        <p>${destino.description}</p>
        ${time}
      </div>
    `;
    contenedor.appendChild(card);
  }
}

function coincidirPalabraClave(texto, query) {
  texto = texto.toLowerCase();
  const claves = [
    'playa', 'playas',
    'templo', 'templos',
    'país', 'pais', 'países', 'paises',
    query
  ];
  return claves.some(clave => texto.includes(clave));
}

async function buscarDestinos() {
  const queryOriginal = document.getElementById('searchInput').value.trim();
  if (!queryOriginal) return;

  const query = queryOriginal.toLowerCase();
  const data = await cargarDatos();
  let resultados = [];

  if (['playa', 'playas'].includes(query)) {
    resultados = data.beaches.map(playa => ({
      ...playa,
      timeZone: playa.timeZone || ''
    }));
  } else if (['templo', 'templos'].includes(query)) {
    resultados = data.temples.map(templo => ({
      ...templo,
      timeZone: templo.timeZone || ''
    }));
  } else if (['país', 'pais', 'países', 'paises'].includes(query)) {
    data.countries.forEach(pais => {
      pais.cities.forEach(ciudad => {
        resultados.push({
          ...ciudad,
          timeZone: pais.timeZone || ''
        });
      });
    });
  } else {
    data.beaches.forEach(playa => {
      if (playa.name.toLowerCase().includes(query) || playa.description.toLowerCase().includes(query)) {
        resultados.push({ ...playa, timeZone: playa.timeZone || '' });
      }
    });

    data.temples.forEach(templo => {
      if (templo.name.toLowerCase().includes(query) || templo.description.toLowerCase().includes(query)) {
        resultados.push({ ...templo, timeZone: templo.timeZone || '' });
      }
    });

    data.countries.forEach(pais => {
      if (pais.name.toLowerCase().includes(query)) {
        pais.cities.forEach(ciudad => {
          resultados.push({ ...ciudad, timeZone: pais.timeZone || '' });
        });
      } else {
        pais.cities.forEach(ciudad => {
          if (ciudad.name.toLowerCase().includes(query) || ciudad.description.toLowerCase().includes(query)) {
            resultados.push({ ...ciudad, timeZone: pais.timeZone || '' });
          }
        });
      }
    });
  }

  await mostrarResultados(resultados);
}

function restablecerResultados() {
  document.getElementById('searchInput').value = '';
  document.getElementById('resultados').innerHTML = '';
}