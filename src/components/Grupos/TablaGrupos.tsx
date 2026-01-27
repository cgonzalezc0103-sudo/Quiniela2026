import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { gruposAPI } from '../../services/api';
import { Grupo, EstadisticaGrupo } from '../../types';
import { SelectChangeEvent } from '@mui/material';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const TablaGrupos: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticaGrupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        setLoading(true);
        const response = await gruposAPI.getGrupos();
        setGrupos(response.data);
        if (response.data.length > 0) {
          setGrupoSeleccionado(response.data[0].idGrupo.toString());
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar grupos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrupos();
  }, []);

  // Obtener estadísticas del grupo seleccionado
  useEffect(() => {
    if (!grupoSeleccionado) return;

    const fetchEstadisticas = async () => {
      setLoading(true);
      try {
        const idGrupo = grupoSeleccionado === 'todos' 
          ? undefined 
          : parseInt(grupoSeleccionado);
        
        const response = await gruposAPI.getEstadisticas(idGrupo);
        setEstadisticas(response.data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [grupoSeleccionado]);

  const handleChangeGrupo = (event: SelectChangeEvent) => {
    setGrupoSeleccionado(event.target.value);
    setError(null);
  };

  // Agrupar estadísticas por grupo (cuando se selecciona "todos")
  const estadisticasPorGrupo = estadisticas.reduce((acc, item) => {
    if (!acc[item.grupo]) {
      acc[item.grupo] = [];
    }
    acc[item.grupo].push(item);
    return acc;
  }, {} as Record<string, EstadisticaGrupo[]>);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tabla de Grupos
        </Typography>
        
        {grupos.length > 0 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="grupo-select-label">Seleccionar Grupo</InputLabel>
            <Select
              labelId="grupo-select-label"
              id="grupo-select"
              value={grupoSeleccionado}
              label="Seleccionar Grupo"
              onChange={handleChangeGrupo}
            >
              <MenuItem value="todos">Todos los Grupos</MenuItem>
              {grupos.map((grupo) => (
                <MenuItem key={grupo.idGrupo} value={grupo.idGrupo.toString()}>
                  Grupo {grupo.grupo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : grupoSeleccionado === 'todos' ? (
        // Mostrar todos los grupos
        Object.entries(estadisticasPorGrupo).map(([grupoNombre, equipos]) => (
          <Box key={grupoNombre} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>
              <Chip label={`Grupo ${grupoNombre}`} color="primary" sx={{ fontSize: '1.2rem', p: 1 }} />
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pos</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Equipo</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PJ</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PG</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PE</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PP</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>GF</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>GC</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>DG</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Pts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipos.map((equipo, index) => (
                    <StyledTableRow key={`${equipo.idGrupo}-${equipo.idEquipo}`}>
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={equipo.siglas} 
                            size="small" 
                            sx={{ mr: 1, fontWeight: 'bold' }}
                          />
                          {equipo.equipo}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{equipo.pj}</TableCell>
                      <TableCell align="center">{equipo.pg}</TableCell>
                      <TableCell align="center">{equipo.pe}</TableCell>
                      <TableCell align="center">{equipo.pp}</TableCell>
                      <TableCell align="center">{equipo.gf}</TableCell>
                      <TableCell align="center">{equipo.gc}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={equipo.dg} 
                          size="small"
                          color={equipo.dg > 0 ? 'success' : equipo.dg < 0 ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={equipo.pts} 
                          color="primary"
                          sx={{ fontWeight: 'bold', minWidth: '40px' }}
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      ) : (
        // Mostrar solo un grupo
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pos</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Equipo</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PJ</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PG</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PE</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>PP</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>GF</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>GC</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>DG</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Pts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estadisticas.length > 0 ? (
                estadisticas.map((equipo, index) => (
                  <StyledTableRow key={equipo.idEquipo}>
                    <TableCell component="th" scope="row">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={equipo.siglas} 
                          size="small" 
                          sx={{ mr: 1, fontWeight: 'bold' }}
                        />
                        {equipo.equipo}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{equipo.pj}</TableCell>
                    <TableCell align="center">{equipo.pg}</TableCell>
                    <TableCell align="center">{equipo.pe}</TableCell>
                    <TableCell align="center">{equipo.pp}</TableCell>
                    <TableCell align="center">{equipo.gf}</TableCell>
                    <TableCell align="center">{equipo.gc}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={equipo.dg} 
                        size="small"
                        color={equipo.dg > 0 ? 'success' : equipo.dg < 0 ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={equipo.pts} 
                        color="primary"
                        sx={{ fontWeight: 'bold', minWidth: '40px' }}
                      />
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Alert severity="info">
                      No hay datos disponibles para este grupo.
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TablaGrupos;