import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Package, Activity } from 'lucide-react';

export function ShiftSummaryCards({ activeShift, isMobile, colors }) {
  if (!activeShift) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? 10 : 16,
      marginBottom: 24,
      width: '100%'
    }}>
      {/* Monto Actual */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: '5px solid #3b82f6',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        transition: 'transform 0.2s',
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: '#dbeafe', padding: 6, borderRadius: 8 }}>
            <Wallet size={16} color="#3b82f6" />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>Saldo Operativo</span>
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#3b82f6', whiteSpace: 'nowrap' }}>
          ${activeShift.currentAmount?.toLocaleString('es-CO') || '0'}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }}></div>
          Ventas - Gastos diarios
        </div>
      </div>

      {/* Ingresos */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: '5px solid #10b981',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: '#d1fae5', padding: 6, borderRadius: 8 }}>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>Ingresos</span>
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap' }}>
          ${activeShift.totalIncome?.toLocaleString('es-CO') || '0'}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></div>
          Ventas
        </div>
      </div>

      {/* Gastos Operativos */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: '5px solid #ef4444',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: '#fee2e2', padding: 6, borderRadius: 8 }}>
            <TrendingDown size={16} color="#ef4444" />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>G. Operativos</span>
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#ef4444', whiteSpace: 'nowrap' }}>
          ${((activeShift.totalExpenses || 0) + (activeShift.totalWithdrawals || 0)).toLocaleString('es-CO')}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></div>
          Egresos diarios
        </div>
      </div>

      {/* Gastos Fijos */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: '5px solid #6366f1',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: '#e0e7ff', padding: 6, borderRadius: 8 }}>
            <Package size={16} color="#6366f1" />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>Gastos Fijos</span>
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#6366f1', whiteSpace: 'nowrap' }}>
          ${activeShift.totalFixedExpenses?.toLocaleString('es-CO') || '0'}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }}></div>
          Arriendo/Serv.
        </div>
      </div>

      {/* Costo Insumos */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: '5px solid #f59e0b',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: '#fef3c7', padding: 6, borderRadius: 8 }}>
            <TrendingDown size={16} color="#f59e0b" />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>Insumos</span>
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#f59e0b', whiteSpace: 'nowrap' }}>
          ${activeShift.totalSupplies?.toLocaleString('es-CO') || '0'}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></div>
          Materiales
        </div>
      </div>

      {/* Movimientos */}
      <div style={{
        background: colors.cardBg,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: 16,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: `5px solid ${colors.text}`,
        boxShadow: `0 4px 12px ${colors.shadow}`,
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 6, borderRadius: 8 }}>
            <Activity size={16} color={colors.text} />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: colors.textSecondary }}>Movimientos</span>
        </div>
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: colors.text }}>
          {activeShift.movementsCount || 0}
        </div>
        <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.text }}></div>
          Registros
        </div>
      </div>
    </div>
  );
}
