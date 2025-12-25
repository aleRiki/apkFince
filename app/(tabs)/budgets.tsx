import AddBudgetModal from '@/components/AddBudgetModal';
import { AddTaskModal } from '@/components/AddTaskModal';
import EditBudgetProgressModal from '@/components/EditBudgetProgressModal';
import EditGoalProgressModal from '@/components/EditGoalProgressModal';
import GoalModal from '@/components/GoalModal';
import LogoutButton from '@/components/LogoutButton';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { TaskItem } from '@/components/TaskItem';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icon mapping for budgets
const getBudgetIcon = (name: string): string => {
  const iconMap: { [key: string]: string } = {
    'alquiler': 'home',
    'comida': 'shopping-cart',
    'entretenimiento': 'film',
    'transporte': 'truck',
    'internet': 'wifi',
    'electricidad': 'zap',
    'teléfono': 'phone',
    'compras': 'shopping-bag',
    'salud': 'heart',
    'deudas': 'credit-card',
  };
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key)) return icon;
  }
  return 'dollar-sign'; // default icon
};

export default function BudgetsScreen() {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals' | 'tasks'>('budgets');

  // Modals state
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Selected budget for editing progress
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);
  const [editProgressModalVisible, setEditProgressModalVisible] = useState(false);

  // Edit Goal State
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null); // Assuming 'any' for now, replace with 'Goal' type
  const [editGoalModalVisible, setEditGoalModalVisible] = useState(false);

  // Use custom hooks for data management
  const { budgets, loading: budgetsLoading, createBudget, updateBudget, fetchBudgets } = useBudgets();
  const { goals, loading: goalsLoading, createGoal, fetchGoals, updateGoal } = useGoals();

  // Tasks hook
  const { tasks, loading: tasksLoading, createTask, toggleTaskCompletion, deleteTask, fetchTasks } = useTasks();

  const handleCreateBudget = async (budgetData: any) => {
    const success = await createBudget(budgetData);
    if (success) {
      setBudgetModalVisible(false);
      alert('Presupuesto creado exitosamente');
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    const success = await createGoal(goalData);
    if (success) {
      setGoalModalVisible(false);
      alert('Meta creada exitosamente');
    }
  };

  const getTransactionCategory = (budgetName: string): string => {
    const lowerName = budgetName.toLowerCase();
    if (lowerName.includes('alquiler') || lowerName.includes('renta')) return 'rent';
    if (lowerName.includes('comida') || lowerName.includes('supermercado') || lowerName.includes('food')) return 'food_groceries';
    if (lowerName.includes('entretenimiento') || lowerName.includes('cine')) return 'entertainment';
    if (lowerName.includes('transporte') || lowerName.includes('gasolina') || lowerName.includes('uber')) return 'transportation';
    if (lowerName.includes('luz') || lowerName.includes('electricidad')) return 'utilities_electricity';
    if (lowerName.includes('telefono') || lowerName.includes('celular')) return 'utilities_phone';
    if (lowerName.includes('internet') || lowerName.includes('wifi')) return 'utilities_internet';
    if (lowerName.includes('deuda') || lowerName.includes('prestamo')) return 'debt_payment';
    if (lowerName.includes('salud') || lowerName.includes('farmacia') || lowerName.includes('medico')) return 'health_care';
    if (lowerName.includes('compras') || lowerName.includes('shopping') || lowerName.includes('ropa')) return 'shopping';
    return 'other_expense';
  };

  const handleUpdateBudgetProgress = async (budgetId: number, data: any) => {
    // Find current budget state before update
    const currentBudget = budgets.find(b => b.id === budgetId);
    console.log('Current budget found:', JSON.stringify(currentBudget, null, 2));

    // Optimistic calculation for transaction
    if (currentBudget && data.porcentajeCumplido !== undefined) {
      const previousPercent = currentBudget.porcentajeCumplido || 0;
      const newPercent = data.porcentajeCumplido;

      if (newPercent > previousPercent) {
        const deltaPercent = newPercent - previousPercent;
        const deltaAmount = (deltaPercent / 100) * currentBudget.presupuesto;

        if (deltaAmount > 0) {
          try {
            const transactionCategory = getTransactionCategory(currentBudget.name);
            const transactionData = {
              transactionType: 'withdraw',
              category: transactionCategory,
              amount: deltaAmount,
              description: `Gasto automático: ${currentBudget.name}`,
              cardId: currentBudget.card?.id || currentBudget.cardId
            };

            console.log('Creating automatic transaction:', JSON.stringify(transactionData));
            await api.post('/api/v1/transaction', transactionData);
          } catch (error) {
            console.error('Error creating automatic transaction:', error);
            // Don't block the UI update if transaction fails
          }
        }
      }
    }

    const success = await updateBudget(budgetId, data);
    if (success) {
      setEditProgressModalVisible(false);
      alert('Progreso actualizado y gasto registrado');
    }
  };

  const handleBudgetPress = (budget: any) => {
    setSelectedBudget(budget);
    setEditProgressModalVisible(true);
  };

  const handleUpdateGoal = async (goalId: number, data: any) => {
    const success = await updateGoal(goalId, data);
    if (success) {
      setEditGoalModalVisible(false);
    }
  };

  const openEditGoal = (goal: any) => {
    setSelectedGoal(goal);
    setEditGoalModalVisible(true);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchBudgets(), fetchGoals(), fetchTasks()]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Presupuestos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={budgetsLoading || goalsLoading || tasksLoading}
          >
            <Feather
              name="refresh-cw"
              size={22}
              color={(budgetsLoading || goalsLoading || tasksLoading) ? appTheme.colors.textSecondary : appTheme.colors.primary}
            />
          </TouchableOpacity>
          <LogoutButton />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budgets' && styles.activeTab]}
          onPress={() => setActiveTab('budgets')}
        >
          <Text style={[styles.tabText, activeTab === 'budgets' && styles.activeTabText]}>
            Presupuestos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Metas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
            Tareas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'budgets' && (
          <>
            {/* Summary Card */}
            {budgets.length > 0 && (() => {
              // Calculate totals
              const totalPresupuesto = budgets.reduce((sum, b) => sum + b.presupuesto, 0);
              const totalGastado = budgets.reduce((sum, b) => {
                const spending = (b.presupuesto * (b.porcentajeCumplido || 0)) / 100;
                return sum + spending;
              }, 0);

              const totalProgressPercent = totalPresupuesto > 0
                ? Math.round((totalGastado / totalPresupuesto) * 100)
                : 0;

              // Determine color based on total progress
              let progressColor = appTheme.colors.info;
              if (totalProgressPercent >= 75) progressColor = appTheme.colors.success;
              else if (totalProgressPercent >= 50) progressColor = appTheme.colors.warning;

              return (
                <LinearGradient
                  colors={['#334155', '#1E293B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.summaryCard}
                >
                  <Text style={styles.summaryLabel}>Total Presupuesto Asignado</Text>
                  <Text style={styles.summaryAmount}>
                    <Text style={{ color: progressColor }}>
                      {formatCurrency(totalGastado)}
                    </Text>
                    <Text style={{ color: appTheme.colors.textSecondary, fontSize: 20 }}> / </Text>
                    {formatCurrency(totalPresupuesto)}
                  </Text>
                  <Text style={styles.summarySubtext}>
                    {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} activo{budgets.length !== 1 ? 's' : ''}
                  </Text>
                  {/* Progress bar - calculated from totals */}
                  <View style={styles.summaryProgressBar}>
                    <View style={[
                      styles.summaryProgressFill,
                      { width: `${totalProgressPercent}%`, backgroundColor: progressColor }
                    ]} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
                    <Text style={[styles.summaryHint, { color: progressColor }]}>
                      {totalProgressPercent}% utilizado
                    </Text>
                    <Text style={styles.summaryHint}>
                      Restante: {formatCurrency(totalPresupuesto - totalGastado)}
                    </Text>
                  </View>
                </LinearGradient>
              );
            })()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tus Presupuestos</Text>
              <Text style={styles.sectionSubtitle}>Gestiona tus presupuestos por tarjeta</Text>
              {budgetsLoading ? (
                <ActivityIndicator color={appTheme.colors.primary} />
              ) : budgets.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Feather name="dollar-sign" size={48} color={appTheme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { marginTop: 16 }]}>
                    No tienes presupuestos creados
                  </Text>
                  <Text style={styles.hintText}>
                    Toca el botón + para agregar un nuevo presupuesto
                  </Text>
                </View>
              ) : (
                budgets.map(budget => {
                  const icon = getBudgetIcon(budget.name);
                  const progress = budget.porcentajeCumplido || 0;
                  const montoGastado = (budget.presupuesto * progress) / 100;
                  let progressColor = appTheme.colors.info;
                  if (progress >= 75) progressColor = appTheme.colors.success;
                  else if (progress >= 50) progressColor = appTheme.colors.warning;

                  const isCompleted = progress >= 100;

                  return (
                    <TouchableOpacity
                      key={budget.id}
                      style={[
                        styles.budgetCard,
                        isCompleted && { opacity: 0.8, backgroundColor: 'rgba(30,30,40,0.8)', borderColor: appTheme.colors.success, borderWidth: 1 }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleBudgetPress(budget)}
                    >
                      <View style={styles.budgetHeader}>
                        <View style={[styles.budgetIconContainer, { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)' }]}>
                          <Feather name={isCompleted ? "check" : icon as any} size={24} color={progressColor} />
                        </View>
                        <View style={styles.budgetInfo}>
                          <Text style={[
                            styles.budgetName,
                            isCompleted && { textDecorationLine: 'line-through', color: appTheme.colors.textSecondary }
                          ]}>{budget.name}</Text>
                          <Text style={styles.budgetDescription} numberOfLines={1}>{budget.description}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.budgetPercent, { color: progressColor }]}>{progress}%</Text>
                        </View>
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                          <Text style={{ color: appTheme.colors.textSecondary, fontSize: 12 }}>Gastado</Text>
                          <Text style={{ color: appTheme.colors.textSecondary, fontSize: 12 }}>Total</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <Text style={styles.budgetAmountSpent}>
                            {formatCurrency(montoGastado)}
                          </Text>
                          <Text style={styles.budgetAmountTotal}>
                            {formatCurrency(budget.presupuesto)}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.budgetProgressBar}>
                        <View
                          style={[
                            styles.budgetProgressFill,
                            { width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }
                          ]}
                        />
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={{ color: appTheme.colors.textSecondary, fontSize: 11 }}>
                          {isCompleted ? 'Completado' : 'Disponible:'} <Text style={{ color: appTheme.colors.text, fontWeight: '600' }}>{formatCurrency(Math.max(0, budget.presupuesto - montoGastado))}</Text>
                        </Text>
                        <Text style={[styles.progressHint, { textAlign: 'right' }]}>
                          {isCompleted ? '✅ Listo' : 'Actualizar'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}

        {activeTab === 'goals' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus Metas</Text>
            <Text style={styles.sectionSubtitle}>Define y alcanza tus objetivos financieros</Text>

            {goalsLoading ? (
              <ActivityIndicator color={appTheme.colors.primary} />
            ) : goals.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Feather name="target" size={48} color={appTheme.colors.textSecondary} />
                <Text style={[styles.emptyText, { marginTop: 16 }]}>
                  No tienes metas creadas
                </Text>
                <Text style={styles.hintText}>
                  Toca el botón + para agregar una nueva meta
                </Text>
              </View>
            ) : (
              goals.map(goal => {
                const progress = goal.progreso || 0;
                let color = appTheme.colors.primary;
                if (progress >= 100) color = appTheme.colors.success;
                else if (progress > 0) color = appTheme.colors.warning;
                else color = appTheme.colors.info;

                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.goalCard}
                    onPress={() => openEditGoal(goal)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.goalHeader}>
                      <View style={[styles.goalIconContainer, { backgroundColor: `${color}20` }]}>
                        <Feather name={progress >= 100 ? 'check-circle' : 'target'} size={24} color={color} />
                      </View>
                      <View style={styles.goalHeaderContent}>
                        <Text style={styles.goalName}>{goal.name}</Text>
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                        {goal.presupuesto && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Feather name="dollar-sign" size={12} color={appTheme.colors.textSecondary} style={{ marginRight: 2 }} />
                            <Text style={{ fontSize: 12, color: appTheme.colors.textSecondary }}>
                              {goal.presupuesto.name}: {formatCurrency(goal.presupuesto.presupuesto)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: color }}>
                          {progress}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar for Goal */}
                    <View style={styles.budgetProgressContainer}>
                      <View style={styles.budgetProgressBar}>
                        <View
                          style={[
                            styles.budgetProgressFill,
                            { width: `${progress}%`, backgroundColor: color }
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus Tareas</Text>
            <Text style={styles.sectionSubtitle}>
              Gestiona tus pendientes financieros y del hogar
            </Text>

            {tasksLoading ? (
              <ActivityIndicator color={appTheme.colors.primary} />
            ) : tasks.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Feather name="check-circle" size={48} color={appTheme.colors.textSecondary} />
                <Text style={[styles.emptyText, { marginTop: 16 }]}>
                  No tienes tareas pendientes
                </Text>
                <Text style={styles.hintText}>
                  Toca el botón + para agregar una nueva tarea
                </Text>
              </View>
            ) : (
              tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={(id) => toggleTaskCompletion(id, task.isCompleted)}
                  onShare={(t) => console.log('Sharing', t)}
                  onPress={(id) => {
                    setSelectedTaskId(id);
                    setTaskDetailModalVisible(true);
                  }}
                />
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          if (activeTab === 'budgets') {
            setBudgetModalVisible(true);
          } else if (activeTab === 'goals') {
            setGoalModalVisible(true);
          } else {
            setTaskModalVisible(true);
          }
        }}
      >
        <View style={styles.fabContent}>
          <Feather name="plus" size={28} color="#FFF" />
        </View>
      </TouchableOpacity>

      <AddBudgetModal
        visible={budgetModalVisible}
        onClose={() => setBudgetModalVisible(false)}
        onSubmit={handleCreateBudget}
      />

      <EditBudgetProgressModal
        visible={editProgressModalVisible}
        onClose={() => setEditProgressModalVisible(false)}
        onSubmit={handleUpdateBudgetProgress}
        budget={selectedBudget}
      />

      <GoalModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onSubmit={handleCreateGoal}
      />

      <AddTaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSubmit={(task) => createTask(task.title, task.category, task.userIds)}
      />

      <TaskDetailModal
        visible={taskDetailModalVisible}
        taskId={selectedTaskId}
        onClose={() => {
          setTaskDetailModalVisible(false);
          setSelectedTaskId(null);
        }}
        onDelete={() => {
          fetchTasks(); // Refresh task list after deletion
        }}
      />
      <EditGoalProgressModal
        visible={editGoalModalVisible}
        onClose={() => setEditGoalModalVisible(false)}
        onSubmit={handleUpdateGoal}
        goal={selectedGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: appTheme.colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: appTheme.colors.backgroundCard,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  container: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: appTheme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  summarySubtext: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 20,
  },
  summaryProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryHint: {
    fontSize: 11,
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 2,
  },
  budgetDescription: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  budgetAmountSpent: {
    fontSize: 20,
    fontWeight: '800',
    color: appTheme.colors.text,
    letterSpacing: -0.5,
  },
  budgetAmountTotal: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetPercent: {
    fontSize: 18,
    fontWeight: '800',
  },
  budgetProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: { // Ensuring progressHint exists to fix lint error
    fontSize: 11,
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  budgetProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalCard: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalHeaderContent: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  goalProgress: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  completedBadge: {
    backgroundColor: appTheme.colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    ...appTheme.shadows.md,
  },
  fabContent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  transactionCategory: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.error,
  },
});
