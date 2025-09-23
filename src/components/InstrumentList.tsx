import React from 'react';
import './InstrumentList.css';

interface WindInstrument {
  id: string;
  name: string;
  family: 'VIENTO_MADERA' | 'VIENTO_METAL';
  afinacion: 'Bb' | 'Eb' | 'F' | 'C' | 'G' | 'D' | 'A' | 'E';
  clef: 'SOL' | 'FA';
  range: string;
  description: string;
}

const WIND_INSTRUMENTS: WindInstrument[] = [
  // Vientos-Madera
  { id: 'piccolo', name: 'Piccolo', family: 'VIENTO_MADERA', afinacion: 'C', clef: 'SOL', range: 'D5-C8', description: 'Pequeña flauta aguda, suena una octava más alta' },
  { id: 'flute', name: 'Flauta', family: 'VIENTO_MADERA', afinacion: 'C', clef: 'SOL', range: 'C4-D7', description: 'Instrumento melódico principal en Do' },
  { id: 'oboe', name: 'Oboe', family: 'VIENTO_MADERA', afinacion: 'C', clef: 'SOL', range: 'Bb3-A6', description: 'Instrumento de doble caña en Do' },
  { id: 'english-horn', name: 'Corno Inglés', family: 'VIENTO_MADERA', afinacion: 'F', clef: 'SOL', range: 'E3-C6', description: 'Oboe contralto en Fa, suena una quinta más grave' },
  { id: 'clarinet-eb', name: 'Clarinete en Eb', family: 'VIENTO_MADERA', afinacion: 'Eb', clef: 'SOL', range: 'G3-C7', description: 'Clarinete agudo en Mi bemol' },
  { id: 'clarinet-bb', name: 'Clarinete en Bb', family: 'VIENTO_MADERA', afinacion: 'Bb', clef: 'SOL', range: 'D3-Bb6', description: 'Clarinete soprano principal en Si bemol' },
  { id: 'clarinet-a', name: 'Clarinete en A', family: 'VIENTO_MADERA', afinacion: 'A', clef: 'SOL', range: 'Db3-A6', description: 'Clarinete soprano en La' },
  { id: 'bass-clarinet', name: 'Clarinete Bajo', family: 'VIENTO_MADERA', afinacion: 'Bb', clef: 'SOL', range: 'D2-F5', description: 'Clarinete bajo en Si bemol, suena una octava más grave' },
  { id: 'bassoon', name: 'Fagot', family: 'VIENTO_MADERA', afinacion: 'C', clef: 'FA', range: 'Bb1-Eb5', description: 'Instrumento grave de doble caña en Do' },
  { id: 'contrabassoon', name: 'Contrafagot', family: 'VIENTO_MADERA', afinacion: 'C', clef: 'FA', range: 'Bb0-Bb3', description: 'Fagot contrabajo, suena una octava más grave' },
  { id: 'alto-sax', name: 'Saxofón Alto', family: 'VIENTO_MADERA', afinacion: 'Eb', clef: 'SOL', range: 'Db3-A5', description: 'Saxofón alto en Mi bemol' },
  { id: 'tenor-sax', name: 'Saxofón Tenor', family: 'VIENTO_MADERA', afinacion: 'Bb', clef: 'SOL', range: 'Ab2-E5', description: 'Saxofón tenor en Si bemol' },
  { id: 'baritone-sax', name: 'Saxofón Barítono', family: 'VIENTO_MADERA', afinacion: 'Eb', clef: 'SOL', range: 'Db2-A4', description: 'Saxofón barítono en Mi bemol' },

  // Vientos-Metales
  { id: 'trumpet-bb', name: 'Trompeta en Bb', family: 'VIENTO_METAL', afinacion: 'Bb', clef: 'SOL', range: 'E3-C6', description: 'Trompeta soprano principal en Si bemol' },
  { id: 'trumpet-c', name: 'Trompeta en C', family: 'VIENTO_METAL', afinacion: 'C', clef: 'SOL', range: 'E3-C6', description: 'Trompeta soprano en Do' },
  { id: 'cornet', name: 'Corneta', family: 'VIENTO_METAL', afinacion: 'Bb', clef: 'SOL', range: 'E3-C6', description: 'Corneta en Si bemol, más cálida que la trompeta' },
  { id: 'flugelhorn', name: 'Fliscorno', family: 'VIENTO_METAL', afinacion: 'Bb', clef: 'SOL', range: 'E3-C6', description: 'Fliscorno en Si bemol, sonido muy cálido' },
  { id: 'french-horn', name: 'Trompa', family: 'VIENTO_METAL', afinacion: 'F', clef: 'SOL', range: 'B2-C6', description: 'Trompa en Fa, puede usar clave de Fa en registro grave' },
  { id: 'trombone', name: 'Trombón', family: 'VIENTO_METAL', afinacion: 'C', clef: 'FA', range: 'E2-F5', description: 'Trombón de varas en Do' },
  { id: 'bass-trombone', name: 'Trombón Bajo', family: 'VIENTO_METAL', afinacion: 'C', clef: 'FA', range: 'C2-F5', description: 'Trombón bajo con gatillo' },
  { id: 'euphonium', name: 'Eufonio', family: 'VIENTO_METAL', afinacion: 'C', clef: 'FA', range: 'E2-C5', description: 'Eufonio barítono en Do' },
  { id: 'tuba', name: 'Tuba', family: 'VIENTO_METAL', afinacion: 'C', clef: 'FA', range: 'D1-F4', description: 'Tuba contrabajo en Do' },
  { id: 'tuba-bb', name: 'Tuba en Bb', family: 'VIENTO_METAL', afinacion: 'Bb', clef: 'FA', range: 'C1-Eb4', description: 'Tuba contrabajo en Si bemol' }
];

const InstrumentList: React.FC = () => {
  const woodwinds = WIND_INSTRUMENTS.filter(inst => inst.family === 'VIENTO_MADERA');
  const brass = WIND_INSTRUMENTS.filter(inst => inst.family === 'VIENTO_METAL');

  const getClefIcon = (clef: string) => clef === 'SOL' ? '𝄞' : '𝄢';
  const getFamilyIcon = (family: string) => family === 'VIENTO_MADERA' ? '🎼' : '🎺';

  return (
    <div className="instruments-container">
      <div className="instruments-header">
        <h2>Instrumentos de Viento</h2>
        <p>Catálogo completo de instrumentos soportados para transcripción automática</p>
      </div>

      <div className="instrument-families">
        <div className="family-section">
          <h3 className="family-title">
            <span className="family-icon">🎼</span>
            Vientos-Madera
            <span className="family-count">({woodwinds.length} instrumentos)</span>
          </h3>
          <div className="instruments-grid">
            {woodwinds.map((instrument) => (
              <div key={instrument.id} className="instrument-card">
                <div className="instrument-header">
                  <div className="instrument-info">
                    <h4 className="instrument-name">{instrument.name}</h4>
                    <div className="instrument-meta">
                      <span className="clef-indicator">
                        {getClefIcon(instrument.clef)} {instrument.clef === 'SOL' ? 'Clave de Sol' : 'Clave de Fa'}
                      </span>
                      <span className="tuning">Afinación: {instrument.afinacion}</span>
                    </div>
                  </div>
                  <div className="instrument-actions">
                    <span className="range-badge">{instrument.range}</span>
                  </div>
                </div>
                <p className="instrument-description">{instrument.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="family-section">
          <h3 className="family-title">
            <span className="family-icon">🎺</span>
            Vientos-Metales
            <span className="family-count">({brass.length} instrumentos)</span>
          </h3>
          <div className="instruments-grid">
            {brass.map((instrument) => (
              <div key={instrument.id} className="instrument-card">
                <div className="instrument-header">
                  <div className="instrument-info">
                    <h4 className="instrument-name">{instrument.name}</h4>
                    <div className="instrument-meta">
                      <span className="clef-indicator">
                        {getClefIcon(instrument.clef)} {instrument.clef === 'SOL' ? 'Clave de Sol' : 'Clave de Fa'}
                      </span>
                      <span className="tuning">Afinación: {instrument.afinacion}</span>
                    </div>
                  </div>
                  <div className="instrument-actions">
                    <span className="range-badge">{instrument.range}</span>
                  </div>
                </div>
                <p className="instrument-description">{instrument.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentList;