"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const data = [
  { name: "Jan", delivered: 452, read: 378, replied: 198 },
  { name: "Feb", delivered: 478, read: 390, replied: 210 },
  { name: "Mar", delivered: 512, read: 425, replied: 232 },
  { name: "Apr", delivered: 580, read: 501, replied: 265 },
  { name: "May", delivered: 620, read: 535, replied: 290 },
  { name: "Jun", delivered: 645, read: 569, replied: 315 },
  { name: "Jul", delivered: 680, read: 610, replied: 345 },
];

export function MessagePerformanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Message Performance</CardTitle>
          <CardDescription>
            Track delivery, read, and response rates of your messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-3 w-[250px]">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-whatsapp" />
                  <span>Delivered</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
                  <span>Read</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-amber-500" />
                  <span>Replied</span>
                </div>
              </div>
            </div>
            
            <TabsContent value="line" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="var(--whatsapp)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="read"
                    stroke="hsl(214, 97%, 58%)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="replied"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="area" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stackId="1"
                    stroke="var(--whatsapp)"
                    fill="var(--whatsapp)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="read"
                    stackId="2"
                    stroke="hsl(214, 97%, 58%)"
                    fill="hsl(214, 97%, 58%)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="replied"
                    stackId="3"
                    stroke="hsl(38, 92%, 50%)"
                    fill="hsl(38, 92%, 50%)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="bar" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="delivered"
                    fill="var(--whatsapp)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="read"
                    fill="hsl(214, 97%, 58%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="replied"
                    fill="hsl(38, 92%, 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
