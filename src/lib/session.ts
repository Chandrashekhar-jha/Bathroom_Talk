'use client';

import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'bathroom_session_id';

export function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
        id = uuidv4();
        localStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

export function clearSession() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
}

const STALL_KEY = 'bathroom_current_stall';

export interface StallSession {
    groupId: string;
    anonymousName: string;
    name: string;
    description: string;
    inviteCode: string;
    role: 'creator' | 'member';
}

export function saveStallSession(stall: StallSession) {
    if (typeof window === 'undefined') return;
    const existing = getAllStalls();
    const idx = existing.findIndex((s) => s.groupId === stall.groupId);
    if (idx >= 0) existing[idx] = stall;
    else existing.push(stall);
    localStorage.setItem(STALL_KEY, JSON.stringify(existing));
}

export function getAllStalls(): StallSession[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STALL_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getStallSession(groupId: string): StallSession | null {
    return getAllStalls().find((s) => s.groupId === groupId) || null;
}
