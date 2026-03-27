import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Container,
  SelectChangeEvent
} from '@mui/material';
import { gruposAPI } from '../../services/api';
import { Grupo, EstadisticaGrupo } from '../../types';
import FlagImage from '../../components/FlagImage';

const TablaGrupos: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticaGrupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          {/* Header similar al de Ranking */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1
              }}
            >
              Tabla de Grupos
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              Aquí puedes ver las estadísticas de los equipos por grupo
            </Typography>
            
            {/* Selector de grupo - centrado */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {grupos.length > 0 && (
                <FormControl sx={{ minWidth: 250 }} size="medium">
                  <InputLabel id="grupo-select-label">Seleccionar Grupo</InputLabel>
                  <Select
                    labelId="grupo-select-label"
                    id="grupo-select"
                    value={grupoSeleccionado}
                    label="Seleccionar Grupo"
                    onChange={handleChangeGrupo}
                    sx={{ bgcolor: 'background.paper' }}
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
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              {error}
            </Alert>
          ) : grupoSeleccionado === 'todos' ? (
            // Mostrar todos los grupos
            grupos.map((grupo) => {
              const equiposGrupo = estadisticas
                .filter(e => e.idGrupo === grupo.idGrupo)
                .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
              
              return equiposGrupo.length > 0 ? (
                <Box key={grupo.idGrupo} sx={{ mb: 4 }}>
                  {/* Título del grupo */}
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'primary.dark',
                      mb: 2,
                      pl: 1,
                      borderLeft: 4,
                      borderColor: 'primary.main'
                    }}
                  >
                    Grupo {grupo.grupo}
                  </Typography>
                  
                  <TableContainer 
                    component={Paper} 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Table size="medium">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Pos</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Equipo</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PJ</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PG</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PE</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PP</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>GF</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>GC</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>DG</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Pts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {equiposGrupo.map((equipo, index) => (
                          <TableRow 
                            key={`${equipo.idGrupo}-${equipo.idEquipo}`}
                            sx={{ 
                              '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <TableCell 
                              component="th" 
                              scope="row"
                              sx={{ 
                                fontWeight: 'medium',
                                color: index < 2 ? 'primary.main' : 'inherit'
                              }}
                            >
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FlagImage 
                                  siglas={equipo.siglas} 
                                  nombre={equipo.equipo}
                                  size="small"
                                />
                                <Typography variant="body1">
                                  {equipo.equipo}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1">
                                {equipo.pj}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                color="success.main"
                              >
                                {equipo.pg}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {equipo.pe}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                color="error.main"
                              >
                                {equipo.pp}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                color="success.main"
                              >
                                {equipo.gf}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                color="error.main"
                              >
                                {equipo.gc}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                sx={{
                                  color: equipo.dg > 0 ? 'success.main' : 
                                         equipo.dg < 0 ? 'error.main' : 
                                         'text.primary'
                                }}
                              >
                                {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                sx={{
                                  bgcolor: 'primary.light',
                                  color: 'primary.contrastText',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  display: 'inline-block',
                                  minWidth: '40px'
                                }}
                              >
                                {equipo.pts}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null;
            })
          ) : (
            // Mostrar un solo grupo
            <TableContainer 
              component={Paper} 
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Pos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Equipo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PJ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PG</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PE</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>PP</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>GF</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>GC</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>DG</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Pts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estadisticas.length > 0 ? (
                    estadisticas
                      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
                      .map((equipo, index) => (
                      <TableRow 
                        key={equipo.idEquipo}
                        sx={{ 
                          '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                      >
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ 
                            fontWeight: 'medium',
                            color: index < 2 ? 'primary.main' : 'inherit'
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <FlagImage 
                              siglas={equipo.siglas} 
                              nombre={equipo.equipo}
                              size="small"
                            />
                            <Typography variant="body1">
                              {equipo.equipo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1">
                            {equipo.pj}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color="success.main"
                          >
                            {equipo.pg}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color="warning.main"
                          >
                            {equipo.pe}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color="error.main"
                          >
                            {equipo.pp}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color="success.main"
                          >
                            {equipo.gf}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color="error.main"
                          >
                            {equipo.gc}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            sx={{
                              color: equipo.dg > 0 ? 'success.main' : 
                                     equipo.dg < 0 ? 'error.main' : 
                                     'text.primary'
                            }}
                          >
                            {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              minWidth: '40px'
                            }}
                          >
                            {equipo.pts}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Alert 
                          severity="info" 
                          sx={{ 
                            maxWidth: 500,
                            mx: 'auto'
                          }}
                        >
                          No hay datos disponibles para este grupo.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TablaGrupos;