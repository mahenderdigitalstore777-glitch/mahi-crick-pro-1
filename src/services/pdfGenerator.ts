/**
 * Mahi Crick Pro - Official Match Summary PDF Generator
 * 
 * Exports comprehensive match summary to high-definition PDF using jsPDF:
 * - Match header (Date, venue, format, overs, toss)
 * - Result banner & winning margin
 * - Official "MAN OF THE MATCH" spotlight section
 * - 1st Innings batting scorecard & bowling analysis
 * - 2nd Innings batting scorecard & bowling analysis
 * - Professional branding with watermark and metadata
 */

import { jsPDF } from 'jspdf';
import { Match, Team, Player, Innings } from '../types/cricket';
import { ScoringEngine } from './scoringEngine';
import { calculateManOfTheMatch } from './manOfTheMatch';

export function generateMatchSummaryPDF(
  match: Match,
  teams: Team[],
  players: Player[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const getPlayerName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.fullName : 'Player';
  };

  const getTeamName = (id: string) => {
    const t = teams.find((tm) => tm.id === id);
    return t ? t.name : 'Team';
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 14;

  // Header Banner
  doc.setFillColor(11, 19, 43); // Dark Navy #0B132B
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Title & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(253, 224, 71); // Gold
  doc.setFontSize(16);
  doc.text('MAHI CRICK PRO', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(8.5);
  doc.text('OFFICIAL CRICKET MATCH SUMMARY & SCORECARD REPORT', 14, 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }), pageWidth - 14, 14, { align: 'right' });

  y = 35;

  // Match Title & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(match.title, 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  const tossTeamName = getTeamName(match.tossWinnerId);
  const metaText = `Format: ${match.matchFormat} (${match.oversPerInnings} Overs)  |  Date: ${match.date}  |  Venue: ${match.venue || 'Cricket Stadium'}`;
  doc.text(metaText, 14, y);
  y += 5;
  doc.text(`Toss: ${tossTeamName} won the toss & elected to ${match.tossDecision.toUpperCase()}`, 14, y);
  y += 7;

  // Result Banner
  if (match.resultSummary) {
    doc.setFillColor(240, 253, 244); // Light emerald
    doc.setDrawColor(16, 185, 129); // Emerald border
    doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.text(`RESULT: ${match.resultSummary.toUpperCase()}`, 18, y + 6.5);
    y += 14;
  }

  // MAN OF THE MATCH SPOTLIGHT
  const motm = calculateManOfTheMatch(match, teams, players);
  if (motm) {
    doc.setFillColor(254, 252, 232); // Light yellow
    doc.setDrawColor(234, 179, 8); // Gold border
    doc.setLineWidth(0.6);
    doc.roundedRect(14, y, pageWidth - 28, 17, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text('★ MAN OF THE MATCH / PLAYER OF THE MATCH', 18, y + 5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${motm.playerName} (${motm.teamName})`, 18, y + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Performance: ${motm.summary}  •  [${motm.totalPoints} Impact Rating]`, 18, y + 15);
    y += 22;
  }

  // Function to render Innings table
  const renderInningsTable = (inn: Innings, innNum: 1 | 2) => {
    const battingTeam = getTeamName(inn.battingTeamId);
    const bowlingTeam = getTeamName(inn.bowlingTeamId);
    const oversFormatted = ScoringEngine.formatOvers(inn.legalDeliveries);

    // Innings Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${innNum === 1 ? '1ST' : '2ND'} INNINGS: ${battingTeam.toUpperCase()}`, 18, y + 5);
    doc.text(
      `${inn.totalRuns}/${inn.wickets} in ${oversFormatted} Overs (Extras: ${inn.extras.total})`,
      pageWidth - 18,
      y + 5,
      { align: 'right' }
    );
    y += 9;

    // Batting Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('BATTER', 16, y + 3.5);
    doc.text('DISMISSAL', 65, y + 3.5);
    doc.text('R', 125, y + 3.5, { align: 'right' });
    doc.text('B', 140, y + 3.5, { align: 'right' });
    doc.text('4s', 153, y + 3.5, { align: 'right' });
    doc.text('6s', 166, y + 3.5, { align: 'right' });
    doc.text('SR', 188, y + 3.5, { align: 'right' });
    y += 5.5;

    // Batters Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    Object.values(inn.batters).forEach((b) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 15;
      }

      let dismissal = 'not out';
      if (b.isOut) {
        if (b.dismissalType === 'bowled') dismissal = `b ${getPlayerName(b.bowlerCreditedId || '')}`;
        else if (b.dismissalType === 'caught') dismissal = `c ${getPlayerName(b.fielderId || '')} b ${getPlayerName(b.bowlerCreditedId || '')}`;
        else if (b.dismissalType === 'lbw') dismissal = `lbw b ${getPlayerName(b.bowlerCreditedId || '')}`;
        else if (b.dismissalType === 'run_out') dismissal = `run out (${getPlayerName(b.fielderId || '')})`;
        else if (b.dismissalType === 'stumped') dismissal = `st ${getPlayerName(b.fielderId || '')} b ${getPlayerName(b.bowlerCreditedId || '')}`;
        else dismissal = b.dismissalType || 'out';
      }

      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';

      doc.setTextColor(15, 23, 42);
      doc.text(getPlayerName(b.playerId), 16, y + 3);
      doc.setTextColor(100, 116, 139);
      doc.text(dismissal.length > 32 ? dismissal.substring(0, 30) + '..' : dismissal, 65, y + 3);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(b.runs), 125, y + 3, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(String(b.balls), 140, y + 3, { align: 'right' });
      doc.text(String(b.fours), 153, y + 3, { align: 'right' });
      doc.text(String(b.sixes), 166, y + 3, { align: 'right' });
      doc.text(sr, 188, y + 3, { align: 'right' });

      y += 4.5;
    });

    y += 2;

    // Bowling Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`BOWLING (${bowlingTeam})`, 16, y + 3.5);
    doc.text('O', 115, y + 3.5, { align: 'right' });
    doc.text('M', 130, y + 3.5, { align: 'right' });
    doc.text('R', 145, y + 3.5, { align: 'right' });
    doc.text('W', 160, y + 3.5, { align: 'right' });
    doc.text('ECON', 188, y + 3.5, { align: 'right' });
    y += 5.5;

    // Bowlers Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    Object.values(inn.bowlers).forEach((bowler) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 15;
      }

      const ov = ScoringEngine.formatOvers(bowler.balls);
      const oversNum = bowler.balls / 6;
      const econ = oversNum > 0 ? (bowler.runs / oversNum).toFixed(2) : '0.00';

      doc.setTextColor(15, 23, 42);
      doc.text(getPlayerName(bowler.playerId), 16, y + 3);
      doc.text(ov, 115, y + 3, { align: 'right' });
      doc.text(String(bowler.maidens), 130, y + 3, { align: 'right' });
      doc.text(String(bowler.runs), 145, y + 3, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text(String(bowler.wickets), 160, y + 3, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.text(econ, 188, y + 3, { align: 'right' });

      y += 4.5;
    });

    y += 6;
  };

  if (match.innings[1]) {
    renderInningsTable(match.innings[1], 1);
  }

  if (match.innings[2]) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 15;
    }
    renderInningsTable(match.innings[2], 2);
  }

  // Footer Branding
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via Mahi Crick Pro — Premium Offline & Live Cricket Scorer', 14, pageHeight - 8);

  const cleanFilename = `Mahi_Crick_Pro_${match.title.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.pdf`;
  doc.save(cleanFilename);
}
