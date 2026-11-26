import { cn } from '@/libs/cn';
import React from 'react';
import { ModalOverlay, type ModalOverlayProps, Modal as RACModal } from 'react-aria-components';

import {type DialogProps, Dialog as RACDialog, Heading} from 'react-aria-components';
import {twMerge} from 'tailwind-merge';

export function Dialog(props: DialogProps) {
  return (
    <RACDialog
      {...props}
      className={twMerge(
        'outline outline-0 box-border p-6 [[data-placement]>&]:p-4 max-h-[inherit] overflow-auto relative',
        props.className
      )}
    />
  );
}

export {Heading};
const overlayStyles = cn({
  base: 'absolute top-0 left-0 w-full h-(--page-height) isolate z-20 bg-black/[50%] text-center backdrop-blur-lg',
  variants: {
    isEntering: {
      true: 'animate-in fade-in duration-200 ease-out'
    },
    isExiting: {
      true: 'animate-out fade-out duration-200 ease-in'
    }
  }
});

const modalStyles = cn({
  base: 'font-sans w-full max-w-[min(90vw,450px)] max-h-[calc(var(--visual-viewport-height)*.9)] rounded-2xl bg-popover dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] text-left align-middle text-popover-foreground shadow-2xl bg-clip-padding border border-border',
  variants: {
    isEntering: {
      true: 'animate-in zoom-in-105 ease-out duration-200'
    },
    isExiting: {
      true: 'animate-out zoom-out-95 ease-in duration-200'
    }
  }
});

export function Modal(props: ModalOverlayProps) {
  return (
    <ModalOverlay {...props} className={overlayStyles}>
      <div className="sticky top-0 left-0 w-full h-(--visual-viewport-height) flex items-center justify-center box-border">
        <RACModal {...props} className={modalStyles} />
      </div>
    </ModalOverlay>
  );
}
