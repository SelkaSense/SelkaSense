import React, { useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"

interface TokenOverviewProps {
  name: string
  symbol: string
  price: number
  change24h: number
  liquidity: number
  holders: number
  confidenceScore?: number // 0–100
  onClick?: () => void
}

function abbreviateNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + "B"
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M"
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K"
  return value.toString()
}

export const TokenOverviewPanel: React.FC<TokenOverviewProps> = React.memo(
  ({
    name,
    symbol,
    price,
    change24h,
    liquidity,
    holders,
    confidenceScore = 76,
    onClick,
  }) => {
    const isPositive = change24h >= 0
    const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight
    const changeColorClass = isPositive ? "text-green-600" : "text-red-600"

    const formattedPrice = useMemo(
      () => price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
      [price],
    )
    const formattedChange = useMemo(
      () => Math.abs(change24h).toFixed(2),
      [change24h],
    )
    const formattedLiquidity = useMemo(
      () => `$${abbreviateNumber(liquidity)}`,
      [liquidity],
    )
    const formattedHolders = useMemo(
      () => abbreviateNumber(holders),
      [holders],
    )

    return (
      <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex items-center justify-between pb-0">
          <div>
            <h2 className="text-xl font-semibold">
              {name} <span className="text-gray-500">({symbol})</span>
            </h2>
          </div>
          <div className="text-lg font-medium">${formattedPrice}</div>
        </CardHeader>

        <CardContent className="pt-2">
          <ul className="space-y-2">
            <li className="flex items-center">
              <ChangeIcon className={`w-4 h-4 mr-1 ${changeColorClass}`} />
              <span className={`${changeColorClass} font-medium`}>
                24h Change: {formattedChange}%
              </span>
            </li>
            <li>
              <span className="font-medium">Liquidity:</span> {formattedLiquidity}
            </li>
            <li>
              <span className="font-medium">Holders:</span> {formattedHolders}
            </li>
            <li>
              <span className="font-medium">Confidence Score:</span> {confidenceScore}/100
            </li>
          </ul>

          <div className="mt-4">
            <Progress value={confidenceScore} className="h-3 rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full ${confidenceScore > 70 ? "bg-green-500" : "bg-red-500"}`}
                role="progressbar"
                aria-valuenow={confidenceScore}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </Progress>
          </div>
        </CardContent>
      </Card>
    )
  }
)

TokenOverviewPanel.displayName = "TokenOverviewPanel"
