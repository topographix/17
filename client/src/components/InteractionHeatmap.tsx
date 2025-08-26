import { useState, useEffect } from 'react';
import { ResponsiveContainer, Tooltip, XAxis, YAxis, ScatterChart, Scatter, Rectangle, ZAxis } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Calendar, Info } from 'lucide-react';

type HeatmapData = {
  x: number; // Hour (0-23)
  y: number; // Day index
  z: number; // Intensity (message count)
  date: string; // Date string for tooltip
  formattedHour: string; // Formatted hour for tooltip
  count: number; // Message count for tooltip
};

interface InteractionHeatmapProps {
  companionId: number;
  className?: string;
}

export default function InteractionHeatmap({ companionId, className }: InteractionHeatmapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<HeatmapData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const timeRangeOptions = {
    'week': 7,
    'month': 30,
    'year': 365
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  useEffect(() => {
    fetchHeatmapData();
  }, [companionId, timeRange]);
  
  const fetchHeatmapData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeRangeOptions[timeRange]);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await apiRequest('GET', 
        `/api/companions/${companionId}/interactions/heatmap?startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch interaction data');
      }
      
      const heatmapData = await response.json();
      
      // Transform heatmap data for the chart
      const transformedData: HeatmapData[] = [];
      
      // For each date
      Object.keys(heatmapData).forEach((dateStr, dayIndex) => {
        const date = new Date(dateStr);
        const dayName = dayNames[date.getDay()];
        const formattedDate = new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
        
        // For each hour
        Object.keys(heatmapData[dateStr]).forEach(hour => {
          const hourNum = parseInt(hour);
          const count = heatmapData[dateStr][hourNum];
          
          if (count > 0) {
            const formattedHour = new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              hour12: true
            }).format(new Date().setHours(hourNum));
            
            transformedData.push({
              x: hourNum,
              y: dayIndex,
              z: Math.min(count, 50), // Cap intensity for visualization
              date: `${dayName}, ${formattedDate}`,
              formattedHour,
              count
            });
          }
        });
      });
      
      setData(transformedData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setError('Failed to load interaction data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-semibold">{data.date}</p>
          <p>{data.formattedHour}</p>
          <p className="text-primary">{data.count} messages</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Custom renderer for the heatmap cells
  const renderCell = (props: any) => {
    const { x, y, width, height, color } = props;
    
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        className="rounded-sm"
      />
    );
  };
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interaction Heatmap
          </CardTitle>
          <CardDescription>
            Visualization of activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Info className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={fetchHeatmapData}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interaction Heatmap
          </CardTitle>
          
          <Select 
            value={timeRange} 
            onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Visualize when you interact the most
        </CardDescription>
      </CardHeader>
      
      <CardContent className="h-72">
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center">
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
            <p className="text-muted-foreground">Loading interaction data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center">
            <Info className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No interaction data found for this time period.</p>
            <p className="text-muted-foreground text-sm">Start chatting to see your activity patterns!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Hour" 
                domain={[0, 23]}
                tickCount={6}
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Day" 
                tickCount={0}
                hide
              />
              <ZAxis 
                type="number"
                dataKey="z"
                range={[15, 100]}
                scale="sqrt"
              />
              <Tooltip content={renderTooltip} />
              <Scatter 
                data={data} 
                fill="#E91E63"
                shape={renderCell}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}