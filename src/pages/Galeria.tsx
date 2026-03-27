import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FlagImage from '../components/FlagImage';

// ============================================
// DATOS COMPLETOS - ESTADIOS (16 estadios)
// ============================================
const estadios = [
  {
    id: 1,
    nombre: 'Estadio Azteca',
    ciudad: 'Ciudad de México, México',
    capacidad: '87,523',
    descripcion: 'El Estadio Azteca es el estadio más emblemático de México y uno de los más famosos del mundo. Será sede del partido inaugural del Mundial 2026.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/ciudad-de-mexico.avif',
    año: '1966'
  },
  {
    id: 2,
    nombre: 'Estadio BBVA',
    ciudad: 'Monterrey, México',
    capacidad: '53,500',
    descripcion: 'Conocido como "El Gigante de Acero", es uno de los estadios más modernos de México con su impresionante fachada de acero.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/monterrey.avif',
    año: '2015'
  },
  {
    id: 3,
    nombre: 'Estadio Akron',
    ciudad: 'Guadalajara, México',
    capacidad: '49,850',
    descripcion: 'Sede del Club Deportivo Guadalajara, destaca por su diseño vanguardista y su estructura de acero.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/guadalajara.avif',
    año: '2010'
  },
  {
    id: 4,
    nombre: 'MetLife Stadium',
    ciudad: 'East Rutherford, New Jersey, USA',
    capacidad: '82,500',
    descripcion: 'El estadio más grande de la NFL, será sede de la final del Mundial 2026. Alberga a los New York Giants y New York Jets.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/new-york-new-jersey.avif',
    año: '2010'
  },
  {
    id: 5,
    nombre: 'SoFi Stadium',
    ciudad: 'Inglewood, California, USA',
    capacidad: '70,240',
    descripcion: 'El estadio más tecnológico del mundo, con un techo transparente y diseño futurista. Sede de Los Angeles Rams y Chargers.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/los-angeles.avif',
    año: '2020'
  },
  {
    id: 6,
    nombre: 'BC Place',
    ciudad: 'Vancouver, Canadá',
    capacidad: '54,500',
    descripcion: 'El estadio con techo retráctil más grande de Canadá, sede de los Vancouver Whitecaps.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/bc-place-vancouver.avif',
    año: '1983'
  },
  {
    id: 7,
    nombre: 'AT&T Stadium',
    ciudad: 'Arlington, Texas, USA',
    capacidad: '80,000',
    descripcion: 'Conocido como "Jerry World", es el estadio con la pantalla gigante más grande del mundo. Sede de los Dallas Cowboys.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/dallas.avif',
    año: '2009'
  },
  {
    id: 8,
    nombre: 'NRG Stadium',
    ciudad: 'Houston, Texas, USA',
    capacidad: '72,220',
    descripcion: 'Estadio con techo retráctil, sede de los Houston Texans. Ha albergado múltiples Super Bowls.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/houston.avif',
    año: '2002'
  },
  {
    id: 9,
    nombre: 'Hard Rock Stadium',
    ciudad: 'Miami Gardens, Florida, USA',
    capacidad: '65,326',
    descripcion: 'Sede de los Miami Dolphins y del Miami Open. Ha albergado múltiples Super Bowls y finales de la Copa América.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/miami.avif',
    año: '1987'
  },
  {
    id: 10,
    nombre: 'Mercedes-Benz Stadium',
    ciudad: 'Atlanta, Georgia, USA',
    capacidad: '75,000',
    descripcion: 'Uno de los estadios más modernos del mundo, con un techo retráctil con forma de panal.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/atlanta.avif',
    año: '2017'
  },
  {
    id: 11,
    nombre: 'Lincoln Financial Field',
    ciudad: 'Filadelfia, Pennsylvania, USA',
    capacidad: '69,176',
    descripcion: 'Sede de los Philadelphia Eagles, conocido por su atmósfera eléctrica.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/filadelfia.jpg',
    año: '2003'
  },
  {
    id: 12,
    nombre: 'Gillette Stadium',
    ciudad: 'Foxborough, Massachusetts, USA',
    capacidad: '65,878',
    descripcion: 'Sede de los New England Patriots, uno de los estadios más icónicos de la NFL.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/boston.avif',
    año: '2002'
  },
  {
    id: 13,
    nombre: 'Levi’s Stadium',
    ciudad: 'Santa Clara, California, USA',
    capacidad: '71,000',
    descripcion: 'Sede de los San Francisco 49ers, conocido por su tecnología de punta y sostenibilidad.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/bahia-san-francisco.avif',
    año: '2014'
  },
  {
    id: 14,
    nombre: 'Lumen Field',
    ciudad: 'Seattle, Washington, USA',
    capacidad: '68,740',
    descripcion: 'Conocido como el estadio más ruidoso del mundo, sede de los Seattle Seahawks.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/seattle.avif',
    año: '2002'
  },
  {
    id: 15,
    nombre: 'BMO Field',
    ciudad: 'Toronto, Canadá',
    capacidad: '45,000',
    descripcion: 'Estadio principal de Toronto, sede de la selección canadiense y del Toronto FC.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/toronto.avif',
    año: '2007'
  },
  {
    id: 16,
    nombre: 'GEHA Field at Arrowhead Stadium',
    ciudad: 'Kansas City, USA',
    capacidad: '73.000',
    descripcion: 'El Estadio Kansas City está certificado por Guinness World Records como el recinto deportivo al aire libre más ruidoso del mundo y ha acogido un récord de cinco campeonatos de conferencia de la NFL consecutivos.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/estadios/kansas-city.avif',
    año: '1972'
  }
];

// ============================================
// DATOS COMPLETOS - CIUDADES (16 ciudades)
// ============================================
const ciudades = [
  {
    id: 1,
    nombre: 'Ciudad de México',
    pais: 'México',
    descripcion: 'La capital mexicana es una de las ciudades más grandes del mundo. Con su rica historia, gastronomía y cultura, será una de las sedes principales del torneo.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/cdmx.avif',
    atractivos: ['Zócalo', 'Teotihuacán', 'Museo Frida Kahlo', 'Xochimilco']
  },
  {
    id: 2,
    nombre: 'Monterrey',
    pais: 'México',
    descripcion: 'Conocida como la "Ciudad de las Montañas", Monterrey es un importante centro industrial y cultural del norte de México.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/monterrey.avif',
    atractivos: ['Cerro de la Silla', 'Paseo Santa Lucía', 'Macroplaza', 'Fundidora']
  },
  {
    id: 3,
    nombre: 'Guadalajara',
    pais: 'México',
    descripcion: 'Cuna del tequila y el mariachi, Guadalajara es conocida por su arquitectura colonial y su vibrante vida cultural.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/guadalajara.avif',
    atractivos: ['Catedral', 'Hospicio Cabañas', 'Tlaquepaque', 'Tequila']
  },
  {
    id: 4,
    nombre: 'Los Ángeles',
    pais: 'USA',
    descripcion: 'La ciudad del entretenimiento, famosa por Hollywood, sus playas y su diversidad cultural.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/los-angeles.avif',
    atractivos: ['Hollywood', 'Santa Mónica', 'Disneyland', 'Beverly Hills']
  },
  {
    id: 5,
    nombre: 'Nueva York',
    pais: 'USA',
    descripcion: 'La Gran Manzana, una de las ciudades más icónicas del mundo, con su skyline inconfundible y su energía única.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/new-york.avif',
    atractivos: ['Times Square', 'Central Park', 'Estatua de la Libertad', 'Broadway']
  },
  {
    id: 6,
    nombre: 'Vancouver',
    pais: 'Canadá',
    descripcion: 'Rodeada de montañas y océano, Vancouver es conocida por su belleza natural y su estilo de vida activo.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/vancouver.avif',
    atractivos: ['Stanley Park', 'Granville Island', 'Gastown', 'Capilano Bridge']
  },
  {
    id: 7,
    nombre: 'Dallas',
    pais: 'USA',
    descripcion: 'Ciudad texana conocida por su cultura del rodeo, su vibrante escena gastronómica y el icónico distrito deportivo.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/dallas.avif',
    atractivos: ['Dealey Plaza', 'Dallas Arboretum', 'Bishop Arts District', 'Reunion Tower']
  },
  {
    id: 8,
    nombre: 'Houston',
    pais: 'USA',
    descripcion: 'La ciudad más diversa de Estados Unidos, famosa por el Centro Espacial Johnson y su escena culinaria internacional.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/houston.avif',
    atractivos: ['Space Center Houston', 'Museum District', 'Galveston Island', 'Buffalo Bayou']
  },
  {
    id: 9,
    nombre: 'Miami',
    pais: 'USA',
    descripcion: 'Ciudad vibrante con playas espectaculares, influencia latina y una vida nocturna legendaria.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/miami.avif',
    atractivos: ['South Beach', 'Little Havana', 'Everglades', 'Wynwood Walls']
  },
  {
    id: 10,
    nombre: 'Atlanta',
    pais: 'USA',
    descripcion: 'Ciudad sureña con rica historia del movimiento por los derechos civiles y una moderna escena cultural.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/atlanta.avif',
    atractivos: ['Centro CNN', 'Acuario de Georgia', 'Casa de Martin Luther King', 'Piedmont Park']
  },
  {
    id: 11,
    nombre: 'Filadelfia',
    pais: 'USA',
    descripcion: 'Cuna de la independencia estadounidense, con historia colonial y una vibrante escena artística.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/filadelfia.avif',
    atractivos: ['Campana de la Libertad', 'Museo de Arte', 'Reading Terminal Market', 'Independence Hall']
  },
  {
    id: 12,
    nombre: 'Boston',
    pais: 'USA',
    descripcion: 'Ciudad universitaria con gran tradición deportiva e histórica, cuna de la revolución americana.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/boston.avif',
    atractivos: ['Freedom Trail', 'Fenway Park', 'Harvard University', 'Quincy Market']
  },
  {
    id: 13,
    nombre: 'San Francisco',
    pais: 'USA',
    descripcion: 'Ciudad icónica por el puente Golden Gate, sus colinas y el espíritu tecnológico de Silicon Valley.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/san-francisco.avif',
    atractivos: ['Golden Gate Bridge', 'Alcatraz', 'Fisherman’s Wharf', 'Chinatown']
  },
  {
    id: 14,
    nombre: 'Seattle',
    pais: 'USA',
    descripcion: 'Ciudad verde rodeada de agua y montañas, conocida por su cultura del café y música grunge.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/seattle.avif',
    atractivos: ['Space Needle', 'Pike Place Market', 'Museo de la Cultura Pop', 'Chihuly Garden']
  },
  {
    id: 15,
    nombre: 'Toronto',
    pais: 'Canadá',
    descripcion: 'La ciudad más poblada de Canadá, multicultural y vibrante, con la icónica Torre CN.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/toronto.avif',
    atractivos: ['CN Tower', 'Ripley’s Aquarium', 'Royal Ontario Museum', 'Distillery District']
  },
  {
    id: 16,
    nombre: 'Kansas City',
    pais: 'USA',
    descripcion: 'Kansas City es donde el progreso se une a la promesa. Los estadios de máxima categoría y las comunidades llenas de vida de nuestra región son el punto de encuentro entre los negocios, la cultura y la innovación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/ciudades/kansas-city.avif',
    atractivos: ['National WWI Museum and Memorial', 'The Nelson-Atkins Museum of Art', 'Union Station', 'Country Club Plaza']
  }
];

// ============================================
// DATOS COMPLETOS - EQUIPOS (48 equipos clasificados)
// 3 anfitriones + 45 clasificados en orden alfabético
// ============================================
const equipos = [
  // ========== ANFITRIONES (3) ==========
  {
    id: 1,
    nombre: 'México',
    siglas: 'mex', // Debes agregar la sigla (ej: 'MEX')
    confederacion: 'CONCACAF',
    copasMundiales: 17,
    mejorResultado: 'Cuartos de final (1970, 1986)',
    descripcion: 'El "Tri" es el equipo más representativo de CONCACAF. Como anfitrión junto a USA y Canadá, buscará hacer historia en casa.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/mexico.webp',
    estrellas: ['Hirving Lozano', 'Santiago Giménez', 'Edson Álvarez', 'Raúl Jiménez']
  },
  {
    id: 2,
    nombre: 'USA',
    siglas: 'usa', // Debes agregar la sigla (ej: 'USA')
    confederacion: 'CONCACAF',
    copasMundiales: 11,
    mejorResultado: 'Tercer lugar (1930)',
    descripcion: 'La selección estadounidense ha crecido enormemente en las últimas décadas. Como coanfitrión, buscará superar sus mejores marcas.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/usa.webp',
    estrellas: ['Christian Pulisic', 'Weston McKennie', 'Gio Reyna', 'Tim Weah']
  },
  {
    id: 3,
    nombre: 'Canadá',
    siglas: 'can', // Debes agregar la sigla (ej: 'CAN')
    confederacion: 'CONCACAF',
    copasMundiales: 2,
    mejorResultado: 'Fase de grupos (1986)',
    descripcion: 'La selección canadiense llega con su generación dorada. Por primera vez clasifica como coanfitrión.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/canada.webp',
    estrellas: ['Alphonso Davies', 'Jonathan David', 'Stephen Eustáquio', 'Cyle Larin']
  },
  
  // ========== RESTO DE EQUIPOS EN ORDEN ALFABÉTICO ==========
  {
    id: 4,
    nombre: 'Alemania',
    siglas: 'ale', // Debes agregar la sigla (ej: 'GER')
    confederacion: 'UEFA',
    copasMundiales: 20,
    mejorResultado: 'Campeón (1954, 1974, 1990, 2014)',
    descripcion: 'Los "Mannschaft" buscan recuperar el protagonismo tras los últimos torneos irregulares.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/alemania.webp',
    estrellas: ['Jamal Musiala', 'Kai Havertz', 'Florian Wirtz', 'Joshua Kimmich']
  },
  {
    id: 5,
    nombre: 'Argelia',
    siglas: 'alg', // Debes agregar la sigla (ej: 'ALG')
    confederacion: 'CAF',
    copasMundiales: 4,
    mejorResultado: 'Octavos de final (2014)',
    descripcion: 'Los "Zorros del Desierto" buscan repetir su buena actuación de Brasil 2014.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/algelia.jpg',
    estrellas: ['Riyad Mahrez', 'Ismaël Bennacer', 'Youcef Atal', 'Said Benrahma']
  },
  {
    id: 6,
    nombre: 'Arabia Saudita',
    siglas: 'ara', // Debes agregar la sigla (ej: 'KSA')
    confederacion: 'AFC',
    copasMundiales: 6,
    mejorResultado: 'Octavos de final (1994)',
    descripcion: 'Los "Halcones Verdes" sorprendieron venciendo a Argentina en Qatar. Buscan seguir creciendo.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/arabia-saudita.avif',
    estrellas: ['Salem Al-Dawsari', 'Feras Al-Brikan', 'Saud Abdulhamid', 'Yasser Al-Shahrani']
  },
  {
    id: 7,
    nombre: 'Argentina',
    siglas: 'arg', // Debes agregar la sigla (ej: 'ARG')
    confederacion: 'CONMEBOL',
    copasMundiales: 18,
    mejorResultado: 'Campeón (1978, 1986, 2022)',
    descripcion: 'El campeón defensor llega con la ilusión de repetir el título. Messi buscará su último mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/argentina.jpg',
    estrellas: ['Lionel Messi', 'Ángel Di María', 'Enzo Fernández', 'Julián Álvarez']
  },
  {
    id: 8,
    nombre: 'Australia',
    siglas: 'ast', // Debes agregar la sigla (ej: 'AUS')
    confederacion: 'AFC',
    copasMundiales: 6,
    mejorResultado: 'Octavos de final (2006, 2022)',
    descripcion: 'Los "Socceroos" sorprendieron en Qatar. Buscan seguir creciendo.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/australia.jfif',
    estrellas: ['Mathew Ryan', 'Harry Souttar', 'Craig Goodwin', 'Jackson Irvine']
  },
  {
    id: 9,
    nombre: 'Austria',
    siglas: 'aus', // Debes agregar la sigla (ej: 'AUT')
    confederacion: 'UEFA',
    copasMundiales: 7,
    mejorResultado: 'Tercer lugar (1954)',
    descripcion: 'Los austriacos buscan regresar a los primeros planos del fútbol mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/austria.jpg',
    estrellas: ['David Alaba', 'Marcel Sabitzer', 'Konrad Laimer', 'Christoph Baumgartner']
  },
  {
    id: 10,
    nombre: 'Bélgica',
    siglas: 'bel', // Debes agregar la sigla (ej: 'BEL')
    confederacion: 'UEFA',
    copasMundiales: 14,
    mejorResultado: 'Tercer lugar (2018)',
    descripcion: 'La "Generación Dorada" belga busca su primer título mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/belgica.jpg',
    estrellas: ['Kevin De Bruyne', 'Romelu Lukaku', 'Jérémy Doku', 'Youri Tielemans']
  },
  {
    id: 11,
    nombre: 'Brasil',
    siglas: 'bra', // Debes agregar la sigla (ej: 'BRA')
    confederacion: 'CONMEBOL',
    copasMundiales: 22,
    mejorResultado: 'Campeón (1958, 1962, 1970, 1994, 2002)',
    descripcion: 'El pentacampeón siempre es candidato. Con su estilo ofensivo, buscará la sexta estrella.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/brasil.jfif',
    estrellas: ['Vinícius Jr.', 'Neymar', 'Rodrygo', 'Raphinha']
  },
  {
    id: 12,
    nombre: 'Cabo Verde',
    siglas: 'cab', // Debes agregar la sigla (ej: 'CPV')
    confederacion: 'CAF',
    copasMundiales: 0,
    mejorResultado: 'Primera participación',
    descripcion: 'Los "Tubarões Azuis" harán su debut en un Mundial. Una de las grandes sorpresas de las eliminatorias africanas.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/cabo-verde.webp',
    estrellas: ['Jovane Cabral', 'Garry Rodrigues', 'Dylan Tavares', 'Ryan Mendes']
  },
  {
    id: 13,
    nombre: 'Colombia',
    siglas: 'col', // Debes agregar la sigla (ej: 'COL')
    confederacion: 'CONMEBOL',
    copasMundiales: 6,
    mejorResultado: 'Cuartos de final (2014)',
    descripcion: 'Los "Cafeteros" viven su mejor momento. Buscan repetir la gesta de Brasil 2014.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/colombia.webp',
    estrellas: ['Luis Díaz', 'James Rodríguez', 'Jhon Durán', 'Richard Ríos']
  },
  {
    id: 14,
    nombre: 'Corea del Sur',
    siglas: 'cor', // Debes agregar la sigla (ej: 'KOR')
    confederacion: 'AFC',
    copasMundiales: 11,
    mejorResultado: 'Semifinales (2002)',
    descripcion: 'Los "Tigres de Asia" son un equipo combativo. Buscan repetir su mejor actuación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/corea-del-sur.avif',
    estrellas: ['Son Heung-min', 'Kim Min-jae', 'Lee Kang-in', 'Hwang Hee-chan']
  },
  {
    id: 15,
    nombre: 'Costa de Marfil',
    siglas: 'cos', // Debes agregar la sigla (ej: 'CIV')
    confederacion: 'CAF',
    copasMundiales: 3,
    mejorResultado: 'Fase de grupos (2006, 2010, 2014)',
    descripcion: 'Los "Elefantes" buscan regresar a los primeros planos del fútbol africano.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/costa-de-marfil.jpg',
    estrellas: ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé', 'Ibrahim Sangaré']
  },
  {
    id: 16,
    nombre: 'Croacia',
    siglas: 'cro', // Debes agregar la sigla (ej: 'CRO')
    confederacion: 'UEFA',
    copasMundiales: 6,
    mejorResultado: 'Subcampeón (2018)',
    descripcion: 'Los "Vatreni" sorprendieron en Rusia 2018. Buscan otra gran actuación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/croacia.jfif',
    estrellas: ['Luka Modrić', 'Josko Gvardiol', 'Ivan Perišić', 'Mateo Kovačić']
  },
  {
    id: 17,
    nombre: 'Curasao',
    siglas: 'cur', // Debes agregar la sigla (ej: 'CUW')
    confederacion: 'CONCACAF',
    copasMundiales: 0,
    mejorResultado: 'Primera participación',
    descripcion: 'La sorpresa caribeña que buscará dejar huella en su debut mundialista.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/curasao.jfif',
    estrellas: ['Juninho Bacuna', 'Leandro Bacuna', 'Cuco Martina', 'Kenji Gorré']
  },
  {
    id: 18,
    nombre: 'Ecuador',
    siglas: 'ecu', // Debes agregar la sigla (ej: 'ECU')
    confederacion: 'CONMEBOL',
    copasMundiales: 4,
    mejorResultado: 'Octavos de final (2006)',
    descripcion: 'La "Tri" ecuatoriana ha crecido en los últimos años. Busca superar su mejor marca.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/ecuador.jpeg',
    estrellas: ['Moisés Caicedo', 'Pervis Estupiñán', 'Enner Valencia', 'Kendry Páez']
  },
  {
    id: 19,
    nombre: 'Egipto',
    siglas: 'egi', // Debes agregar la sigla (ej: 'EGY')
    confederacion: 'CAF',
    copasMundiales: 3,
    mejorResultado: 'Fase de grupos (1934, 1990, 2018)',
    descripcion: 'Los "Faraones" buscan repetir su participación tras Rusia 2018.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/egipto.jfif',
    estrellas: ['Mohamed Salah', 'Mohamed Elneny', 'Mostafa Mohamed', 'Omar Marmoush']
  },
  {
    id: 20,
    nombre: 'Escocia',
    siglas: 'esc', // Debes agregar la sigla (ej: 'SCO')
    confederacion: 'UEFA',
    copasMundiales: 8,
    mejorResultado: 'Fase de grupos (1954, 1958, 1974, 1978, 1982, 1986, 1990, 1998)',
    descripcion: 'Los "Tartan Army" regresan a un Mundial tras 28 años de ausencia.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/escocia.jpeg',
    estrellas: ['Scott McTominay', 'Andy Robertson', 'John McGinn', 'Billy Gilmour']
  },
  {
    id: 21,
    nombre: 'España',
    siglas: 'esp', // Debes agregar la sigla (ej: 'ESP')
    confederacion: 'UEFA',
    copasMundiales: 16,
    mejorResultado: 'Campeón (2010)',
    descripcion: 'La "Roja" renovó su plantel y vuelve con fuerza. Busca repetir el título de Sudáfrica 2010.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/espana.webp',
    estrellas: ['Pedri', 'Gavi', 'Rodri', 'Álvaro Morata']
  },
  {
    id: 22,
    nombre: 'Francia',
    siglas: 'fra', // Debes agregar la sigla (ej: 'FRA')
    confederacion: 'UEFA',
    copasMundiales: 16,
    mejorResultado: 'Campeón (1998, 2018)',
    descripcion: 'Subcampeón en Qatar, Francia tiene una generación de lujo que buscará la revancha.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/francia.jpg',
    estrellas: ['Kylian Mbappé', 'Antoine Griezmann', 'Aurélien Tchouaméni', 'Eduardo Camavinga']
  },
  {
    id: 23,
    nombre: 'Ghana',
    siglas: 'gha', // Debes agregar la sigla (ej: 'GHA')
    confederacion: 'CAF',
    copasMundiales: 4,
    mejorResultado: 'Cuartos de final (2010)',
    descripcion: 'Los "Black Stars" estuvieron cerca de la semifinal en 2010. Buscan repetir la gesta.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/ghana.webp',
    estrellas: ['Mohammed Kudus', 'Thomas Partey', 'Jordan Ayew', 'Iñaki Williams']
  },
  {
    id: 24,
    nombre: 'Haiti',
    siglas: 'hai', // Debes agregar la sigla (ej: 'HAI')
    confederacion: 'CONCACAF',
    copasMundiales: 1,
    mejorResultado: 'Fase de grupos (1974)',
    descripcion: 'Los "Grenadiers" buscan repetir su histórica participación de Alemania 1974.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/haiti.jfif',
    estrellas: ['Duckens Nazon', 'Frantzdy Pierrot', 'Derrick Etienne', 'Ricardo Adé']
  },
  {
    id: 25,
    nombre: 'Holanda',
    siglas: 'hol', // Debes agregar la sigla (ej: 'NED')
    confederacion: 'UEFA',
    copasMundiales: 11,
    mejorResultado: 'Subcampeón (1974, 1978, 2010)',
    descripcion: 'La "Naranja Mecánica" siempre es candidata. Busca su primera estrella mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/holanda.jpg',
    estrellas: ['Virgil van Dijk', 'Frenkie de Jong', 'Cody Gakpo', 'Xavi Simons']
  },
  {
    id: 26,
    nombre: 'Inglaterra',
    siglas: 'ing', // Debes agregar la sigla (ej: 'ENG')
    confederacion: 'UEFA',
    copasMundiales: 16,
    mejorResultado: 'Campeón (1966)',
    descripcion: 'Los "Three Lions" vienen de una buena generación. Buscan su segundo título mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/inglaterra.jfif',
    estrellas: ['Jude Bellingham', 'Harry Kane', 'Bukayo Saka', 'Phil Foden']
  },
  {
    id: 27,
    nombre: 'Iran',
    siglas: 'ira', // Debes agregar la sigla (ej: 'IRN')
    confederacion: 'AFC',
    copasMundiales: 6,
    mejorResultado: 'Fase de grupos (1978, 1998, 2006, 2014, 2018, 2022)',
    descripcion: 'Los "Príncipes de Persia" son una potencia asiática. Buscan avanzar más allá de fase de grupos.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/iran.jpg',
    estrellas: ['Sardar Azmoun', 'Mehdi Taremi', 'Ali Reza Jahanbakhsh', 'Saman Ghoddos']
  },
  {
    id: 28,
    nombre: 'Japón',
    siglas: 'jap', // Debes agregar la sigla (ej: 'JPN')
    confederacion: 'AFC',
    copasMundiales: 7,
    mejorResultado: 'Octavos de final (2002, 2010, 2018, 2022)',
    descripcion: 'Los "Samuráis Azules" son el equipo más regular de Asia. Buscan superar octavos.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/japon.jpg',
    estrellas: ['Takefusa Kubo', 'Daichi Kamada', 'Wataru Endo', 'Kaoru Mitoma']
  },
  {
    id: 29,
    nombre: 'Jordania',
    siglas: 'jor', // Debes agregar la sigla (ej: 'JOR')
    confederacion: 'AFC',
    copasMundiales: 0,
    mejorResultado: 'Primera participación',
    descripcion: 'Los "Nashama" harán su debut mundialista tras una brillante clasificación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/jordania.jpg',
    estrellas: ['Musa Al-Taamari', 'Yazan Al-Naimat', 'Nizar Al-Rashdan', 'Yazeed Abulaila']
  },
  {
    id: 30,
    nombre: 'Marruecos',
    siglas: 'mar', // Debes agregar la sigla (ej: 'MAR')
    confederacion: 'CAF',
    copasMundiales: 6,
    mejorResultado: 'Semifinales (2022)',
    descripcion: 'Los "Leones del Atlas" hicieron historia en Qatar. Buscan consolidarse como potencia africana.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/marruecos.jpg',
    estrellas: ['Achraf Hakimi', 'Hakim Ziyech', 'Yassine Bounou', 'Nayef Aguerd']
  },
  {
    id: 31,
    nombre: 'Noruega',
    siglas: 'nor', // Debes agregar la sigla (ej: 'NOR')
    confederacion: 'UEFA',
    copasMundiales: 3,
    mejorResultado: 'Octavos de final (1938, 1998)',
    descripcion: 'Los noruegos regresan a un Mundial tras 28 años con una generación liderada por Haaland.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/noruega.webp',
    estrellas: ['Erling Haaland', 'Martin Ødegaard', 'Alexander Sørloth', 'Kristoffer Ajer']
  },
  {
    id: 32,
    nombre: 'Nueva Zelanda',
    siglas: 'nue', // Debes agregar la sigla (ej: 'NZL')
    confederacion: 'OFC',
    copasMundiales: 2,
    mejorResultado: 'Fase de grupos (1982, 2010)',
    descripcion: 'Los "All Whites" regresan a la máxima cita tras su participación en Sudáfrica 2010.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/nueva-zelanda.jpg',
    estrellas: ['Chris Wood', 'Winston Reid', 'Ryan Thomas', 'Joe Bell']
  },
  {
    id: 33,
    nombre: 'Panamá',
    siglas: 'pan', // Debes agregar la sigla (ej: 'PAN')
    confederacion: 'CONCACAF',
    copasMundiales: 1,
    mejorResultado: 'Fase de grupos (2018)',
    descripcion: 'Los canaleros hicieron historia en Rusia 2018. Buscan repetir la clasificación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/panama.webp',
    estrellas: ['Aníbal Godoy', 'Yoel Bárcenas', 'Michael Murillo', 'Cristian Martínez']
  },
  {
    id: 34,
    nombre: 'Paraguay',
    siglas: 'par', // Debes agregar la sigla (ej: 'PAR')
    confederacion: 'CONMEBOL',
    copasMundiales: 8,
    mejorResultado: 'Cuartos de final (2010)',
    descripcion: 'La "Albirroja" es conocida por su garra y defensa sólida. Busca volver al mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/paraguay.jpeg',
    estrellas: ['Miguel Almirón', 'Julio Enciso', 'Antonio Sanabria', 'Mathías Villasanti']
  },
  {
    id: 35,
    nombre: 'Portugal',
    siglas: 'por', // Debes agregar la sigla (ej: 'POR')
    confederacion: 'UEFA',
    copasMundiales: 8,
    mejorResultado: 'Tercer lugar (1966)',
    descripcion: 'Los lusos tienen una generación talentosa. Buscan mejorar su mejor participación.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/portugal.jpg',
    estrellas: ['Cristiano Ronaldo', 'Bernardo Silva', 'João Cancelo', 'Rúben Dias']
  },
  {
    id: 36,
    nombre: 'Qatar',
    siglas: 'qat', // Debes agregar la sigla (ej: 'QAT')
    confederacion: 'AFC',
    copasMundiales: 1,
    mejorResultado: 'Fase de grupos (2022)',
    descripcion: 'Los anfitriones de 2022 buscan demostrar su crecimiento en el fútbol mundial.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/qatar.avif',
    estrellas: ['Akram Afif', 'Almoez Ali', 'Hassan Al-Haydos', 'Abdelkarim Hassan']
  },
  {
    id: 37,
    nombre: 'Senegal',
    siglas: 'sen', // Debes agregar la sigla (ej: 'SEN')
    confederacion: 'CAF',
    copasMundiales: 3,
    mejorResultado: 'Cuartos de final (2002)',
    descripcion: 'Los "Leones de Teranga" son los campeones de África. Buscan repetir la hazaña de 2002.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/senegal.jpg',
    estrellas: ['Sadio Mané', 'Kalidou Koulibaly', 'Édouard Mendy', 'Pape Matar Sarr']
  },
  {
    id: 38,
    nombre: 'Sudáfrica',
    siglas: 'sud', // Debes agregar la sigla (ej: 'RSA')
    confederacion: 'CAF',
    copasMundiales: 3,
    mejorResultado: 'Fase de grupos (1998, 2002, 2010)',
    descripcion: 'Los "Bafana Bafana" buscan repetir su histórica participación como anfitriones en 2010.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/sudafrica.webp',
    estrellas: ['Percy Tau', 'Themba Zwane', 'Ronwen Williams', 'Lyle Foster']
  },
  {
    id: 39,
    nombre: 'Suiza',
    siglas: 'sui', // Debes agregar la sigla (ej: 'SUI')
    confederacion: 'UEFA',
    copasMundiales: 12,
    mejorResultado: 'Cuartos de final (1934, 1938, 1954)',
    descripcion: 'Los suizos son un equipo sólido y competitivo. Buscan dar el salto de calidad.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/suiza.jpeg',
    estrellas: ['Granit Xhaka', 'Manuel Akanji', 'Xherdan Shaqiri', 'Remo Freuler']
  },
  {
    id: 40,
    nombre: 'Túnez',
    siglas: 'tun', // Debes agregar la sigla (ej: 'TUN')
    confederacion: 'CAF',
    copasMundiales: 6,
    mejorResultado: 'Fase de grupos (1978, 1998, 2002, 2006, 2018, 2022)',
    descripcion: 'Las "Águilas de Cartago" son un equipo competitivo que busca avanzar más allá de fase de grupos.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/tunez.avif',
    estrellas: ['Youssef Msakni', 'Wahbi Khazri', 'Ellyes Skhiri', 'Aissa Laïdouni']
  },
  {
    id: 41,
    nombre: 'Uzbekistán',
    siglas: 'ube', // Debes agregar la sigla (ej: 'UZB')
    confederacion: 'AFC',
    copasMundiales: 0,
    mejorResultado: 'Primera participación',
    descripcion: 'Los "Wolfpack" harán su debut mundialista tras una destacada campaña en las eliminatorias asiáticas.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/uzbekistan.webp',
    estrellas: ['Eldor Shomurodov', 'Jaloliddin Masharipov', 'Otabek Shukurov', 'Rustam Ashurmatov']
  },
  {
    id: 42,
    nombre: 'Uruguay',
    siglas: 'uru', // Debes agregar la sigla (ej: 'URU')
    confederacion: 'CONMEBOL',
    copasMundiales: 14,
    mejorResultado: 'Campeón (1930, 1950)',
    descripcion: 'La "Celeste" tiene una rica historia mundialista. Buscará volver a ser protagonista.',
    imagen: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/uruguay.jpeg',
    estrellas: ['Federico Valverde', 'Darwin Núñez', 'Ronald Araújo', 'Manuel Ugarte']
  }
];

// Constante para elementos por página
const ITEMS_PER_PAGE = 6;

const Galeria: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState<'estadios' | 'ciudades' | 'equipos'>('estadios');
  const [paginaActual, setPaginaActual] = useState(1);
  const { user } = useAuth();

  // Obtener los datos según la sección activa
  const getItems = () => {
    switch (seccionActiva) {
      case 'estadios': return estadios;
      case 'ciudades': return ciudades;
      case 'equipos': return equipos;
      default: return estadios;
    }
  };

  const items = getItems();
  const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (paginaActual - 1) * ITEMS_PER_PAGE;
  const itemsPagina = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const secciones = {
    estadios: {
      titulo: '🏟️ Estadios del Mundial 2026',
      descripcion: 'Conoce los 16 estadios que albergarán los partidos del Mundial 2026 en Canadá, México y Estados Unidos.',
      items: estadios
    },
    ciudades: {
      titulo: '🌆 Ciudades Sede',
      descripcion: 'Descubre las 16 ciudades anfitrionas que recibirán a los aficionados de todo el mundo.',
      items: ciudades
    },
    equipos: {
      titulo: '⚽ Equipos Participantes',
      descripcion: 'Los 48 equipos que disputarán el Mundial 2026. Conoce a los favoritos y sus estrellas.',
      items: equipos
    }
  };

  const contenido = secciones[seccionActiva];

  const cambiarPagina = (pagina: number) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarSeccion = (seccion: 'estadios' | 'ciudades' | 'equipos') => {
    setSeccionActiva(seccion);
    setPaginaActual(1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <span className="emoji">📸</span>
          <span className="text-gradient">Galería Mundial 2026</span>
        </h1>
        <p>Explora los estadios, ciudades y equipos del próximo Mundial</p>
      </div>

      {/* Tabs de navegación */}
      <div className="galeria-tabs">
        <button
          className={`galeria-tab ${seccionActiva === 'estadios' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('estadios')}
        >
          🏟️ Estadios ({estadios.length})
        </button>
        <button
          className={`galeria-tab ${seccionActiva === 'ciudades' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('ciudades')}
        >
          🌆 Ciudades ({ciudades.length})
        </button>
        <button
          className={`galeria-tab ${seccionActiva === 'equipos' ? 'active' : ''}`}
          onClick={() => cambiarSeccion('equipos')}
        >
          ⚽ Equipos ({equipos.length})
        </button>
      </div>

      {/* Descripción de la sección */}
      <div className="galeria-header">
        <h2>{contenido.titulo}</h2>
        <p>{contenido.descripcion}</p>
      </div>

      {/* Grid de contenido */}
      <div className="galeria-grid">
        {itemsPagina.map((item) => (
          <div key={item.id} className="galeria-card">
            <div className="galeria-card-image">
              <img 
                src={item.imagen} 
                alt={item.nombre}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250/1976d2/ffffff?text=' + encodeURIComponent(item.nombre);
                }}
              />
              {/* Badge o etiqueta según sección */}
              {'capacidad' in item && (
                <div className="card-badge capacidad">{item.capacidad}</div>
              )}
              {'pais' in item && (
                <div className="card-badge pais">{item.pais}</div>
              )}
              {'confederacion' in item && (
                <div className="card-badge confederacion">{item.confederacion}</div>
              )}
            </div>
            
            <div className="galeria-card-content">
              {/* Mostrar bandera si es sección de equipos */}
              {'siglas' in item ? (
                <div className="equipo-header">
                  <FlagImage 
                    siglas={item.siglas} 
                    nombre={item.nombre}
                    size="medium"
                  />
                  <h3>{item.nombre}</h3>
                </div>
              ) : (
                <h3>{item.nombre}</h3>
              )}
              <p className="card-descripcion">{item.descripcion}</p>
              
              {/* Información específica por tipo */}
              {'ciudad' in item && (
                <div className="card-info">
                  <span>📍 {item.ciudad}</span>
                  <span>🏛️ Inaugurado: {item.año}</span>
                </div>
              )}
              
              {'atractivos' in item && (
                <div className="card-info">
                  <span>✨ Atractivos:</span>
                  <div className="atractivos-lista">
                    {item.atractivos.map((atr, idx) => (
                      <span key={idx} className="atractivo-tag">{atr}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {'copasMundiales' in item && (
                <div className="card-info equipos-info">
                  <div className="equipo-stats">
                    <span>🏆 Copas Mundiales: {item.copasMundiales}</span>
                    <span>🥇 Mejor resultado: {item.mejorResultado}</span>
                  </div>
                  <div className="estrellas">
                    <span>⭐ Estrellas:</span>
                    <div className="estrellas-lista">
                      {item.estrellas.map((estrella, idx) => (
                        <span key={idx} className="estrella-tag">{estrella}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            ◀ Anterior
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`pagination-number ${paginaActual === num ? 'active' : ''}`}
                onClick={() => cambiarPagina(num)}
              >
                {num}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente ▶
          </button>
        </div>
      )}

      {/* Contador de elementos */}
      <div className="pagination-info">
        Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, items.length)} de {items.length} elementos
      </div>
    </div>
  );
};

export default Galeria;