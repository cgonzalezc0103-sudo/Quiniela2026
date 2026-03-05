import React from 'react';

interface TerminosCondicionesProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

const TerminosCondiciones: React.FC<TerminosCondicionesProps> = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  showAcceptButton = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container terminos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 TÉRMINOS Y CONDICIONES DE USO</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body terminos-content">
          <div className="terminos-header">
            <h3>QUINIELA MUNDIAL 2026</h3>
            <p className="bienvenida">
              Bienvenido a QUINIELA MUNDIAL 2026. Al registrarse y participar en nuestra quiniela, 
              usted (en adelante, "el Usuario") acepta los siguientes términos y condiciones que rigen 
              el funcionamiento del sistema, la puntuación y la premiación.
            </p>
          </div>

          <div className="terminos-seccion">
            <h4>1. REGISTRO Y EQUIPO FAVORITO</h4>
            <ul>
              <li>
                <strong>Cuenta Única:</strong> Solo se permite un registro por persona. El uso de múltiples 
                cuentas para un mismo usuario será motivo de descalificación sin derecho a reembolso.
              </li>
              <li>
                <strong>Selección del Equipo Favorito:</strong> Al momento del registro, el Usuario deberá 
                seleccionar una (1) selección nacional como su "Equipo Favorito".
              </li>
              <li>
                <strong>Inalterabilidad:</strong> Una vez completado el registro, el Equipo Favorito no podrá 
                ser cambiado bajo ninguna circunstancia, ya que este otorga puntos bonificados durante el 
                progreso del torneo.
              </li>
            </ul>
          </div>

          <div className="terminos-seccion">
            <h4>2. SISTEMA DE PUNTUACIÓN (REGLAS DE JUEGO)</h4>
            <p>La plataforma asignará puntos de forma automática basándose en el resultado oficial del partido al finalizar el tiempo reglamentario (90 min + tiempo de reposición). No se incluyen tandas de penales para el marcador del partido.</p>
            
            <div className="puntuacion-tabla">
              <div className="puntuacion-item">
                <span className="puntuacion-tipo">Acierto de Ganador o Empate (Resultado Simple):</span>
                <span className="puntuacion-puntos">3 puntos</span>
              </div>
              <div className="puntuacion-item">
                <span className="puntuacion-tipo">Acierto Parcial (Ganador + Goles exactos de UN equipo):</span>
                <span className="puntuacion-puntos">5 puntos</span>
              </div>
              <div className="puntuacion-item">
                <span className="puntuacion-tipo">Acierto Perfecto (Marcador Exacto):</span>
                <span className="puntuacion-puntos">7 puntos</span>
              </div>
            </div>
            
            <p className="nota">
              <strong>Nota:</strong> Los puntos no son acumulativos por partido; se asignará el puntaje mayor obtenido según el acierto.
            </p>
          </div>

          <div className="terminos-seccion">
            <h4>3. BONIFICACIÓN POR EQUIPO FAVORITO</h4>
            <p>Se otorgarán puntos extra a la cuenta del Usuario según la fase que alcance su equipo seleccionado. Estos puntos se cargarán de forma automática en tiempo real al momento de confirmarse la clasificación o posición:</p>
            
            <div className="bonificacion-grid">
              <div className="bonificacion-item">
                <span className="fase">Dieciseisavos de final:</span>
                <span className="puntos">+1 punto</span>
              </div>
              <div className="bonificacion-item">
                <span className="fase">Octavos de final:</span>
                <span className="puntos">+1 punto</span>
              </div>
              <div className="bonificacion-item">
                <span className="fase">Cuartos de final:</span>
                <span className="puntos">+2 puntos</span>
              </div>
              <div className="bonificacion-item">
                <span className="fase">Semifinales:</span>
                <span className="puntos">+2 puntos</span>
              </div>
              <div className="bonificacion-item">
                <span className="fase">Tercer lugar:</span>
                <span className="puntos">+2 puntos</span>
              </div>
              <div className="bonificacion-item">
                <span className="fase">Subcampeón (Segundo lugar):</span>
                <span className="puntos">+3 puntos</span>
              </div>
              <div className="bonificacion-item destacado">
                <span className="fase">Campeón (Primer lugar):</span>
                <span className="puntos">+4 puntos</span>
              </div>
            </div>
          </div>

          <div className="terminos-seccion">
            <h4>4. CIERRE DE PRONÓSTICOS Y RANKING</h4>
            <ul>
              <li>
                <strong>Límite de Tiempo:</strong> El sistema permitirá ingresar o modificar pronósticos hasta 
                diez (10) minutos antes de la hora oficial de inicio de cada partido. Transcurrido este tiempo, 
                el partido quedará bloqueado para edición.
              </li>
              <li>
                <strong>Transparencia:</strong> El Ranking Global estará disponible públicamente en la plataforma 
                y se actualizará en tiempo real tras la finalización de cada encuentro y la validación del resultado.
              </li>
            </ul>
          </div>

          <div className="terminos-seccion">
            <h4>5. CRITERIOS DE DESEMPATE</h4>
            <p>En caso de que dos o más usuarios finalicen el torneo con la misma cantidad de puntos totales, se aplicarán los siguientes criterios de desempate en orden de prioridad:</p>
            
            <ol className="desempate-lista">
              <li>Mayor cantidad de Juegos Perfectos (Marcadores exactos de 7 puntos).</li>
              <li>Mayor cantidad de Juegos Parciales (Aciertos de 5 puntos).</li>
              <li>Mayor puntaje obtenido por el Equipo Favorito (Basado en la fase alcanzada).</li>
              <li>Si persiste el empate: Fecha y hora de registro en la aplicación (el usuario que se registró primero).</li>
            </ol>
          </div>

          <div className="terminos-seccion">
            <h4>6. PREMIACIÓN</h4>
            <ul>
              <li>Se premiarán únicamente los primeros diez (10) lugares del Ranking Global al concluir la Gran Final del Mundial.</li>
              <li>La organización se pondrá en contacto con los ganadores a través de los datos suministrados en el registro (correo/teléfono).</li>
              <li>Los premios son personales e intransferibles.</li>
            </ul>
          </div>

          <div className="terminos-seccion">
            <h4>7. RESPONSABILIDAD TÉCNICA</h4>
            <p>
              La administración no se hace responsable por fallas en la conexión a internet del usuario, cortes eléctricos 
              o problemas de dispositivos que impidan la carga del pronóstico antes de los 10 minutos de cierre. 
              Se recomienda realizar sus jugadas con suficiente antelación.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          {showAcceptButton && onAccept && (
            <button onClick={onAccept} className="btn-submit">
              Aceptar Términos y Continuar
            </button>
          )}
          <button onClick={onClose} className="btn-cancel">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;