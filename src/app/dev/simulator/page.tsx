'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IntegrationSimulator } from '../../../components/simulator/IntegrationSimulator';

export default function SimulatorDevPage() {
  // Gate Access (docs/design.md Task 2)
  const isDev = process.env.NODE_ENV !== 'production';
  const isEnabledByFlag = process.env.NEXT_PUBLIC_ENABLE_SIMULATOR === 'true';

  if (!isDev && !isEnabledByFlag) {
    notFound();
  }

  // Simulator Inputs State
  const [simType, setSimType] = useState<'whatsapp_message' | 'pms_booking' | 'inventory_alert' | 'maintenance_due'>('whatsapp_message');
  const [waRoom, setWaRoom] = useState('101');
  const [waName, setWaName] = useState('Arthur Pendragon');
  const [waMessage, setWaMessage] = useState('We need 2 fresh pillows and a dental kit, please.');
  const [pmsRoom, setPmsRoom] = useState('202');
  const [pmsGuest, setPmsGuest] = useState('Lancelot Du Lac');
  const [maintAsset, setMaintAsset] = useState('Lobby Central AC Chiller');
  const [maintType, setMaintType] = useState('AC blowing warm air, room temperature rising');
  const [invItem, setInvItem] = useState('Hotel Toiletries Kit');
  const [invLevel, setInvLevel] = useState('45');
  const [invMin, setInvMin] = useState('100');
  const [simLog, setSimLog] = useState<string>('');

  const triggerSimulation = async () => {
    setSimLog('Sending simulated event payload...');
    const payload: { type: string; metadata: Record<string, unknown> } = {
      type: simType,
      metadata: {},
    };

    if (simType === 'whatsapp_message') {
      payload.metadata = { roomNumber: waRoom, guestName: waName, messageText: waMessage };
    } else if (simType === 'pms_booking') {
      payload.metadata = { roomNumber: pmsRoom, guestName: pmsGuest };
    } else if (simType === 'inventory_alert') {
      payload.metadata = { itemName: invItem, currentLevel: parseFloat(invLevel), minimumLevel: parseFloat(invMin) };
    } else if (simType === 'maintenance_due') {
      payload.metadata = { assetName: maintAsset, maintenanceType: maintType };
    }

    try {
      const isWhatsapp = simType === 'whatsapp_message';
      const endpoint = isWhatsapp ? '/api/integrations/incoming' : '/api/integrations/mock';
      const bodyData = isWhatsapp
        ? {
            messageText: waMessage,
            guestPhone: waName === 'Arthur Pendragon' ? '+15550192834' : '+15550000000',
            targetPhone: '+15550192834',
            propertyId: 'prop-gh-01',
            source: 'WHATSAPP',
          }
        : {
            ...payload,
            propertyId: 'prop-gh-01',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const result = await res.json();
        setSimLog(`Event Ingested successfully!\nStatus: ${result.status}`);
      } else {
        const errText = await res.text();
        setSimLog(`Gateway Error (HTTP ${res.status}): ${errText}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown connection error';
      setSimLog(`Delivery Failed: ${errMsg}`);
    }
  };

  return (
    <div className="min-vh-100 p-4" style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-muted">terminal</span>
              <h4 className="fw-bold font-display m-0">Integration Payload Simulator</h4>
              <span className="badge rounded-1 bg-secondary text-white font-mono px-2 py-0.5" style={{ fontSize: '10px' }}>
                DEV & DEMO ENVIRONMENT ONLY
              </span>
            </div>
            <p className="text-muted small mb-0 mt-1">
              Internal testing surface for simulating WhatsApp guest requests, PMS room check-ins, low inventory triggers, and maintenance alarms.
            </p>
          </div>
          <Link href="/" className="btn btn-outline-ops d-flex align-items-center gap-1">
            <span className="material-symbols-outlined fs-6">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        <IntegrationSimulator
          simType={simType}
          setSimType={setSimType}
          waRoom={waRoom}
          setWaRoom={setWaRoom}
          waName={waName}
          setWaName={setWaName}
          waMessage={waMessage}
          setWaMessage={setWaMessage}
          pmsRoom={pmsRoom}
          setPmsRoom={setPmsRoom}
          pmsGuest={pmsGuest}
          setPmsGuest={setPmsGuest}
          maintAsset={maintAsset}
          setMaintAsset={setMaintAsset}
          maintType={maintType}
          setMaintType={setMaintType}
          invItem={invItem}
          setInvItem={setInvItem}
          invLevel={invLevel}
          setInvLevel={setInvLevel}
          invMin={invMin}
          setInvMin={setInvMin}
          simLog={simLog}
          triggerSimulation={triggerSimulation}
        />
      </div>
    </div>
  );
}
