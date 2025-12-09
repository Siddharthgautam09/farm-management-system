import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardStats, getFinancialSummary } from "@/actions/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import {
  Users,
  DollarSign,
  Activity,
  Package,
  Skull,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats();
  const financial = await getFinancialSummary();

  // Calculate total alerts
  const alertCount =
    (stats.lowStockItems?.length || 0) + (stats.upcomingVaccines?.length || 0);

  return (
    <div className="space-y-4">
      <Header
        user={user}
        alertCount={alertCount}
        lowStockItems={stats.lowStockItems}
        upcomingVaccines={stats.upcomingVaccines}
      />
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Farm Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here&apos;s what&apos;s happening on your farm today.</p>
          </div>
          <Button asChild size="sm" className="w-fit">
            <Link href="/protected/animals">
              <Users className="h-4 w-4 mr-2" />
              Add Animal
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Animal Statistics */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Animals
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalAnimals}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Active Animals
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.aliveAnimals}
                  </p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Animals Sold
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.soldAnimals}
                  </p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Deaths</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {stats.deceasedAnimals}
                  </p>
                </div>
                <Skull className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border border-gray-200 h-20 sm:h-24 ${financial.profitLoss >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Profit/Loss
                  </p>
                  <p className={`text-lg sm:text-2xl font-bold ${financial.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${Math.abs(financial.profitLoss).toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`h-6 w-6 sm:h-8 sm:w-8 ${financial.profitLoss >= 0 ? "text-green-400" : "text-red-400"} flex-shrink-0`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animals by Stage & Category */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Animal Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Animals by Stage
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Current distribution across stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.byStage && Object.keys(stats.byStage).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.byStage).map(([stage, count]) => (
                    <div
                      key={stage}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-base text-gray-700">{stage}</span>
                      <span className="text-base font-semibold">
                        {count as number} animals
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6 text-sm">
                  No active animals
                </p>
              )}
          </CardContent>
        </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Animals by Category
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Breakdown by animal type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.byCategory && Object.keys(stats.byCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-base text-gray-700 capitalize">
                        {category}
                      </span>
                      <span className="text-base font-semibold">
                        {count as number} animals
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6 text-sm">
                  No active animals
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Financial Overview */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Financial Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Investment
                  </p>
                  <p className="text-lg sm:text-xl font-bold">
                    ${financial.totalInvestment.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Active Investment
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    ${financial.activeInvestment.toFixed(2)}
                  </p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Revenue
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    ${financial.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Death Losses
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    ${financial.totalDeathLoss.toFixed(2)}
                  </p>
                </div>
                <Skull className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border border-gray-200 h-20 sm:h-24 ${
              financial.profitLoss >= 0 ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Net Profit/Loss
                  </p>
                  <p
                    className={`text-lg sm:text-xl font-bold ${
                      financial.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(financial.profitLoss).toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`h-6 w-6 sm:h-8 sm:w-8 ${
                  financial.profitLoss >= 0 ? "text-green-400" : "text-red-400"
                } flex-shrink-0`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
        <Card className="border border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Button asChild variant="outline" className="h-14 sm:h-16 flex-col">
                <Link href="/protected/animals ">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm text-center">Register Animal</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 sm:h-16 flex-col">
                <Link href="/protected/reports/slaughter/new">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm text-center">Slaughter Report</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 sm:h-16 flex-col">
                <Link href="/protected/inventory">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm text-center">Manage Inventory</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 sm:h-16 flex-col">
                <Link href="/protected/reports/cost-analysis">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm text-center">Cost Analysis</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
