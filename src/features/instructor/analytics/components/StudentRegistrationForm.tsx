'use client';

import React, { useState } from 'react';
import { Plus, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface StudentRegistrationFormProps {
  onRegister: (phoneNumbers: string[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * StudentRegistrationForm component for bulk student registration
 * Features:
 * - Bulk add by phone numbers (comma/newline separated)
 * - CSV upload support
 * - Manual entry with add/remove
 * - Phone number validation
 */
export function StudentRegistrationForm({
  onRegister,
  isLoading = false,
}: StudentRegistrationFormProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [singleInput, setSingleInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Validate phone number (simple validation for international format)
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  // Parse bulk input (comma or newline separated)
  const parseBulkInput = (input: string): string[] => {
    return input
      .split(/[,\n]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  };

  // Handle bulk add
  const handleBulkAdd = () => {
    const phones = parseBulkInput(bulkInput);
    const validPhones: string[] = [];
    const invalidPhones: string[] = [];

    phones.forEach(phone => {
      if (validatePhone(phone)) {
        if (!phoneNumbers.includes(phone)) {
          validPhones.push(phone);
        }
      } else {
        invalidPhones.push(phone);
      }
    });

    if (validPhones.length > 0) {
      setPhoneNumbers(prev => [...prev, ...validPhones]);
      setBulkInput('');
    }

    if (invalidPhones.length > 0) {
      setErrors([`Invalid phone numbers: ${invalidPhones.join(', ')}`]);
    } else {
      setErrors([]);
    }
  };

  // Handle single add
  const handleSingleAdd = () => {
    const phone = singleInput.trim();
    
    if (!phone) {
      setErrors(['Please enter a phone number']);
      return;
    }

    if (!validatePhone(phone)) {
      setErrors(['Invalid phone number format']);
      return;
    }

    if (phoneNumbers.includes(phone)) {
      setErrors(['Phone number already added']);
      return;
    }

    setPhoneNumbers(prev => [...prev, phone]);
    setSingleInput('');
    setErrors([]);
  };

  // Handle CSV upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      // Remove header if exists
      const phones = lines[0].toLowerCase().includes('phone') ? lines.slice(1) : lines;
      
      const validPhones: string[] = [];
      const invalidPhones: string[] = [];

      phones.forEach(phone => {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (validatePhone(cleaned)) {
          if (!phoneNumbers.includes(cleaned)) {
            validPhones.push(cleaned);
          }
        } else if (cleaned) {
          invalidPhones.push(cleaned);
        }
      });

      if (validPhones.length > 0) {
        setPhoneNumbers(prev => [...prev, ...validPhones]);
      }

      if (invalidPhones.length > 0) {
        setErrors([`Invalid numbers in CSV: ${invalidPhones.slice(0, 5).join(', ')}${invalidPhones.length > 5 ? '...' : ''}`]);
      } else {
        setErrors([]);
      }
    } catch (error) {
      setErrors(['Failed to read CSV file']);
    }

    // Reset input
    event.target.value = '';
  };

  // Remove phone number
  const handleRemove = (phone: string) => {
    setPhoneNumbers(prev => prev.filter(p => p !== phone));
  };

  // Submit registration
  const handleSubmit = async () => {
    if (phoneNumbers.length === 0) {
      setErrors(['Please add at least one phone number']);
      return;
    }

    try {
      await onRegister(phoneNumbers);
      setPhoneNumbers([]);
      setErrors([]);
    } catch (err) {
      const error = err as Error;
      setErrors([error.message || 'Failed to register students']);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Students</CardTitle>
        <CardDescription>
          Add students to this assignment using phone numbers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="bulk" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk">Bulk Add</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          {/* Bulk Add Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-input">Phone Numbers</Label>
              <textarea
                id="bulk-input"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter phone numbers separated by commas or new lines&#10;Example:&#10;+1234567890, +9876543210&#10;or&#10;+1234567890&#10;+9876543210"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter multiple phone numbers separated by commas or line breaks
              </p>
            </div>
            <Button onClick={handleBulkAdd} disabled={!bulkInput || isLoading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Numbers
            </Button>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="single-input">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="single-input"
                  placeholder="+1234567890"
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSingleAdd()}
                  disabled={isLoading}
                />
                <Button onClick={handleSingleAdd} disabled={!singleInput || isLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter phone number with country code (e.g., +1234567890)
              </p>
            </div>
          </TabsContent>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV file with phone numbers</p>
                  </div>
                  <input
                    id="csv-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                CSV should have one phone number per line, optionally with a "phone" header
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-destructive">
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Phone Numbers List */}
        {phoneNumbers.length > 0 && (
          <div className="space-y-2">
            <Label>Added Phone Numbers ({phoneNumbers.length})</Label>
            <div className="rounded-md border p-4 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {phoneNumbers.map((phone) => (
                  <Badge key={phone} variant="secondary" className="gap-1">
                    {phone}
                    <button
                      onClick={() => handleRemove(phone)}
                      className="ml-1 rounded-full hover:bg-destructive/20"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={phoneNumbers.length === 0 || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering Students...
            </>
          ) : (
            `Register ${phoneNumbers.length} Student${phoneNumbers.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
