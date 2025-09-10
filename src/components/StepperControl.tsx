"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";

interface StepperControlProps {
  isConnected: boolean;
  selectedPort?: string;
}

export function StepperControl({ isConnected, selectedPort }: StepperControlProps) {
  // Stepper type selection
  const [stepperType, setStepperType] = useState<'TWO_WIRE' | 'FOUR_WIRE'>('TWO_WIRE');
  
  // TWO_WIRE configuration (step + direction pins)
  const [twoPins, setTwoPins] = useState({
    step: 3,  // Default Y header pin for CNC Shield
    dir: 6    // Default Y header pin for CNC Shield
  });
  
  // FOUR_WIRE configuration (direct motor control)
  const [fourPins, setFourPins] = useState({
    motor1: 2,
    motor2: 3, 
    motor3: 4,
    motor4: 5
  });
  
  const [stepsPerRev, setStepsPerRev] = useState(200);
  const [rpm, setRpm] = useState(180);
  
  // Movement parameters
  const [steps, setSteps] = useState(200);
  const [direction, setDirection] = useState<0 | 1>(1); // 0=CCW, 1=CW
  const [accel, setAccel] = useState(0);
  const [decel, setDecel] = useState(0);

  const stepperMove = api.stepper.move.useMutation();
  const stepperInit = api.stepper.initialize.useMutation();

  const handleInitialize = async () => {
    if (!selectedPort) return;
    
    try {
      await stepperInit.mutateAsync({
        port: selectedPort,
        type: stepperType,
        pins: stepperType === 'TWO_WIRE' ? twoPins : fourPins,
        stepsPerRev,
        rpm
      });
    } catch (error) {
      console.error('Failed to initialize stepper:', error);
    }
  };

  const handleMove = async () => {
    if (!selectedPort) return;
    
    try {
      await stepperMove.mutateAsync({
        port: selectedPort,
        steps,
        direction,
        rpm,
        accel: accel > 0 ? accel : undefined,
        decel: decel > 0 ? decel : undefined
      });
    } catch (error) {
      console.error('Failed to move stepper:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-500 mb-2">Stepper Motor Control</h3>
        <p className="text-sm text-gray-400">Connect to a serial port first</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Stepper Motor Control</h3>
      
      {/* Stepper Type Selection */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Stepper Type</h4>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setStepperType('TWO_WIRE')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              stepperType === 'TWO_WIRE'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            TWO_WIRE
          </button>
          <button
            onClick={() => setStepperType('FOUR_WIRE')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              stepperType === 'FOUR_WIRE'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FOUR_WIRE
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {stepperType === 'TWO_WIRE' 
            ? 'Driver board (A4988, DRV8825) - Step + Direction pins' 
            : 'Direct motor control - 4 motor coil pins'
          }
        </p>
      </div>

      {/* Pin Configuration */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Pin Configuration</h4>
        
        {stepperType === 'TWO_WIRE' ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label htmlFor="step-pin" className="block text-xs text-gray-600">Step Pin</label>
              <input
                id="step-pin"
                type="number"
                value={twoPins.step}
                onChange={(e) => setTwoPins(prev => ({ ...prev, step: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
            <div>
              <label htmlFor="dir-pin" className="block text-xs text-gray-600">Direction Pin</label>
              <input
                id="dir-pin"
                type="number"
                value={twoPins.dir}
                onChange={(e) => setTwoPins(prev => ({ ...prev, dir: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label htmlFor="motor1-pin" className="block text-xs text-gray-600">Motor 1 Pin</label>
              <input
                id="motor1-pin"
                type="number"
                value={fourPins.motor1}
                onChange={(e) => setFourPins(prev => ({ ...prev, motor1: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
            <div>
              <label htmlFor="motor2-pin" className="block text-xs text-gray-600">Motor 2 Pin</label>
              <input
                id="motor2-pin"
                type="number"
                value={fourPins.motor2}
                onChange={(e) => setFourPins(prev => ({ ...prev, motor2: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
            <div>
              <label htmlFor="motor3-pin" className="block text-xs text-gray-600">Motor 3 Pin</label>
              <input
                id="motor3-pin"
                type="number"
                value={fourPins.motor3}
                onChange={(e) => setFourPins(prev => ({ ...prev, motor3: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
            <div>
              <label htmlFor="motor4-pin" className="block text-xs text-gray-600">Motor 4 Pin</label>
              <input
                id="motor4-pin"
                type="number"
                value={fourPins.motor4}
                onChange={(e) => setFourPins(prev => ({ ...prev, motor4: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-xs"
                min="0"
                max="13"
              />
            </div>
          </div>
        )}
      </div>

      {/* Motor Configuration */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Motor Configuration</h4>
        <div className="space-y-2 text-sm">
          <div>
            <label htmlFor="steps-per-rev" className="block text-xs text-gray-600">Steps per Revolution</label>
            <input
              id="steps-per-rev"
              type="number"
              value={stepsPerRev}
              onChange={(e) => setStepsPerRev(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-xs"
              min="1"
              placeholder="200"
            />
          </div>
          <div>
            <label htmlFor="rpm-speed" className="block text-xs text-gray-600">RPM (Speed)</label>
            <input
              id="rpm-speed"
              type="number"
              value={rpm}
              onChange={(e) => setRpm(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-xs"
              min="1"
              max="1000"
              placeholder="180"
            />
          </div>
        </div>
      </div>

      {/* Initialize Button */}
      <button
        onClick={handleInitialize}
        disabled={stepperInit.isPending}
        className="w-full mb-4 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {stepperInit.isPending ? 'Initializing...' : `Initialize ${stepperType} Stepper`}
      </button>

      {/* Movement Controls */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Movement Control</h4>
        <div className="space-y-2 text-sm">
          <div>
            <label htmlFor="steps-to-move" className="block text-xs text-gray-600">Steps to Move</label>
            <input
              id="steps-to-move"
              type="number"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-xs"
              min="1"
              placeholder="200"
            />
          </div>
          
          <div>
            <label htmlFor="direction-select" className="block text-xs text-gray-600">Direction</label>
            <select
              id="direction-select"
              value={direction}
              onChange={(e) => setDirection(parseInt(e.target.value) as 0 | 1)}
              className="w-full px-2 py-1 border rounded text-xs"
            >
              <option value={1}>Clockwise (CW)</option>
              <option value={0}>Counter-Clockwise (CCW)</option>
            </select>
          </div>

          <div>
            <label htmlFor="acceleration" className="block text-xs text-gray-600">Acceleration (steps)</label>
            <input
              id="acceleration"
              type="number"
              value={accel}
              onChange={(e) => setAccel(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-xs"
              min="0"
              placeholder="0 (disabled)"
            />
          </div>

          <div>
            <label htmlFor="deceleration" className="block text-xs text-gray-600">Deceleration (steps)</label>
            <input
              id="deceleration"
              type="number"
              value={decel}
              onChange={(e) => setDecel(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-xs"
              min="0"
              placeholder="0 (disabled)"
            />
          </div>
        </div>
      </div>

      {/* Move Button */}
      <button
        onClick={handleMove}
        disabled={stepperMove.isPending}
        className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
      >
        {stepperMove.isPending ? 'Moving...' : 'Move Stepper'}
      </button>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setSteps(stepsPerRev);
            setDirection(1);
            void handleMove();
          }}
          disabled={stepperMove.isPending}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          1 Rev CW
        </button>
        <button
          onClick={() => {
            setSteps(stepsPerRev);
            setDirection(0);
            void handleMove();
          }}
          disabled={stepperMove.isPending}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          1 Rev CCW
        </button>
      </div>

      {/* Status Display */}
      {(stepperInit.error ?? stepperMove.error) && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          Error: {stepperInit.error?.message ?? stepperMove.error?.message}
        </div>
      )}
      
      {(stepperInit.isSuccess || stepperMove.isSuccess) && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600">
          {stepperInit.isSuccess && 'Stepper initialized successfully!'}
          {stepperMove.isSuccess && 'Movement completed!'}
        </div>
      )}
    </div>
  );
}
