"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(({ className, ...props }, ref) => <AlertDialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px]", className)} {...props} />);
AlertDialogOverlay.displayName = "AlertDialogOverlay";
export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({ className, ...props }, ref) => <AlertDialogPrimitive.Portal><AlertDialogOverlay /><AlertDialogPrimitive.Content ref={ref} className={cn(className)} {...props} /></AlertDialogPrimitive.Portal>);
AlertDialogContent.displayName = "AlertDialogContent";
export const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => <div className="space-y-2 text-left">{children}</div>;
export const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => <div className="mt-5 flex justify-end gap-2">{children}</div>;
export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
