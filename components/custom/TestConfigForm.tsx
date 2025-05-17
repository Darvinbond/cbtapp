'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';

interface TestConfigFormProps {
  config: {
    name: string;
    description: string;
    max_score: number;
    pass_score: number;
    time_limit_minutes: number;
  };
  onChange: (config: TestConfigFormProps['config']) => void;
}

export default function TestConfigForm({ config, onChange }: TestConfigFormProps) {
  const handleChange = (field: keyof TestConfigFormProps['config'], value: string | number) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Test Name</Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
            placeholder="Enter test name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
            placeholder="Enter test description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_score">Maximum Score</Label>
            <Input
              id="max_score"
              type="number"
              min={0}
              value={config.max_score}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('max_score', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pass_score">Passing Score</Label>
            <Input
              id="pass_score"
              type="number"
              min={0}
              max={config.max_score}
              value={config.pass_score}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('pass_score', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_limit">Time Limit (minutes)</Label>
            <Input
              id="time_limit"
              type="number"
              min={1}
              value={config.time_limit_minutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('time_limit_minutes', parseInt(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
