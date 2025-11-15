"use client";

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { env } from '../lib/env';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().max(500).optional(),
  utmSource: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LeadForm() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.status === 200 || res.status === 201) {
        toast.success('Thanks! We will be in touch.');
        reset();
        return;
      }
      if (res.status === 429) {
        toast.error('Too many requests. Please try again in a minute.');
        return;
      }
      toast.error('Oops, something went wrong. Please try again later.');
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please check your connection.');
    }
  };

  return (
    <div ref={formRef} id="lead-form" className="max-w-xl mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input placeholder="Jane Doe" {...register('name')} />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" placeholder="jane@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <Textarea rows={4} placeholder="Tell us what you need" {...register('message')} />
          {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Request Info'}
        </Button>
      </form>
    </div>
  );
}
