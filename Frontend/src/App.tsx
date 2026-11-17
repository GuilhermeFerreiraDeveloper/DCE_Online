import { Route, Routes } from 'react-router-dom'
import { OfficerLayout } from '@/components/layout/OfficerLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RadioPlayer } from '@/components/layout/RadioPlayer'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import Dashboard from '@/pages/Dashboard'
import NovoDetento from '@/pages/NovoDetento'
import DetentoDetalhe from '@/pages/DetentoDetalhe'
import CodigoPenal from '@/pages/CodigoPenal'
import MinhaConta from '@/pages/MinhaConta'
import Aprovacoes from '@/pages/Aprovacoes'
import Oficiais from '@/pages/Oficiais'
import Auditoria from '@/pages/Auditoria'
import Estatisticas from '@/pages/Estatisticas'
import NaoEncontrado from '@/pages/NaoEncontrado'

export default function App() {
  return (
    <>
      <Routes>
        {/* Área pública */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Área logada */}
        <Route element={<ProtectedRoute />}>
          <Route element={<OfficerLayout />}>
            <Route path="/painel" element={<Dashboard />} />
            <Route path="/painel/novo" element={<NovoDetento />} />
            <Route path="/painel/detento/:id" element={<DetentoDetalhe />} />
            <Route path="/painel/codigo-penal" element={<CodigoPenal />} />
            <Route path="/painel/perfil" element={<MinhaConta />} />
          </Route>
        </Route>

        {/* Área exclusiva do Comando */}
        <Route element={<ProtectedRoute niveis={[1]} />}>
          <Route element={<OfficerLayout />}>
            <Route path="/comando/aprovacoes" element={<Aprovacoes />} />
            <Route path="/comando/oficiais" element={<Oficiais />} />
            <Route path="/comando/auditoria" element={<Auditoria />} />
            <Route path="/comando/estatisticas" element={<Estatisticas />} />
          </Route>
        </Route>

        <Route path="*" element={<NaoEncontrado />} />
      </Routes>

      {/* Rádio interna flutuante (global) */}
      <RadioPlayer />
    </>
  )
}
