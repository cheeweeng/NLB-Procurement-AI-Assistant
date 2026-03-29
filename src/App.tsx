import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Search, 
  Bell, 
  User,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Download,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { ProcurementProject, ProcurementType, ComplianceIssue } from './types';
import { generateProcurementDraft, reviewProcurementDraft } from './lib/gemini';

const MOCK_PROJECTS: ProcurementProject[] = [
  {
    id: '1',
    title: 'Supply of Digital Library Kiosks',
    type: 'RS',
    status: 'Review',
    lastModified: '2026-03-27',
    content: '# Requirement Specifications for Digital Library Kiosks\n\n## 1. Introduction\nThe National Library Board (NLB) requires the supply and installation of 50 digital kiosks...',
    complianceScore: 85
  },
  {
    id: '2',
    title: 'Library Management System Upgrade',
    type: 'AOR',
    status: 'Drafting',
    lastModified: '2026-03-28',
    content: ''
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'draft' | 'review'>('dashboard');
  const [projects, setProjects] = useState<ProcurementProject[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProcurementProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ score: number; issues: ComplianceIssue[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drafting form state
  const [draftForm, setDraftForm] = useState({
    title: '',
    type: 'RS' as ProcurementType,
    description: '',
    requirements: ''
  });

  const handleCreateDraft = async () => {
    setIsGenerating(true);
    setReviewResult(null);
    setError(null);
    try {
      const content = await generateProcurementDraft(draftForm.type, draftForm.description, draftForm.requirements);
      const newProject: ProcurementProject = {
        id: Math.random().toString(36).substr(2, 9),
        title: draftForm.title,
        type: draftForm.type,
        status: 'Drafting',
        lastModified: new Date().toISOString().split('T')[0],
        content
      };
      setProjects([newProject, ...projects]);
      setSelectedProject(newProject);
      setActiveTab('dashboard');
      setDraftForm({
        title: '',
        type: 'RS',
        description: '',
        requirements: ''
      });
    } catch (err: any) {
      console.error('Drafting failed:', err);
      setError(err.message || 'An unexpected error occurred while generating the draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async (project: ProcurementProject) => {
    setIsReviewing(true);
    setError(null);
    try {
      const result = await reviewProcurementDraft(project.content);
      setReviewResult(result);
      setProjects(projects.map(p => p.id === project.id ? { ...p, complianceScore: result.score, complianceIssues: result.issues, status: 'Review' } : p));
      if (selectedProject?.id === project.id) {
        setSelectedProject({ ...selectedProject, complianceScore: result.score, complianceIssues: result.issues, status: 'Review' });
      }
    } catch (err: any) {
      console.error('Review failed:', err);
      setError(err.message || 'An unexpected error occurred during the review.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom border-slate-100">
          <div className="w-10 h-10 bg-[#00529B] rounded-lg flex items-center justify-center text-white font-bold">
            NLB
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Procurement AI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Internal Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSelectedProject(null); }} 
          />
          <NavItem 
            icon={<Plus size={18} />} 
            label="New Draft" 
            active={activeTab === 'draft'} 
            onClick={() => {
              setActiveTab('draft');
              setDraftForm({
                title: '',
                type: 'RS',
                description: '',
                requirements: ''
              });
              setSelectedProject(null);
              setReviewResult(null);
            }} 
          />
          <NavItem 
            icon={<ShieldCheck size={18} />} 
            label="Compliance Review" 
            active={activeTab === 'review'} 
            onClick={() => setActiveTab('review')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">Procurement Officer</p>
              <p className="text-[10px] text-slate-500 truncate">NLB HQ</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects, documents, evaluation reports..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <ProjectDetail 
                project={selectedProject} 
                onBack={() => setSelectedProject(null)} 
                onReview={() => handleReview(selectedProject)}
                isReviewing={isReviewing}
                reviewResult={reviewResult}
              />
            ) : activeTab === 'dashboard' ? (
              <Dashboard 
                projects={projects} 
                onSelectProject={setSelectedProject} 
              />
            ) : activeTab === 'draft' ? (
              <DraftingTool 
                form={draftForm} 
                setForm={setDraftForm} 
                onSubmit={handleCreateDraft} 
                isGenerating={isGenerating} 
              />
            ) : (
              <ReviewTool 
                projects={projects} 
                onReview={handleReview}
                isReviewing={isReviewing}
                reviewResult={reviewResult}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-[#00529B]/10 text-[#00529B]" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Dashboard({ projects, onSelectProject }: { projects: ProcurementProject[], onSelectProject: (p: ProcurementProject) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Procurement Dashboard</h2>
          <p className="text-slate-500">Manage and track your active procurement documents.</p>
        </div>
        <div className="flex gap-3">
          <StatCard label="Active Projects" value={projects.length.toString()} />
          <StatCard label="Pending Review" value={projects.filter(p => p.status === 'Review').length.toString()} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                project.type === 'AOR' ? "bg-blue-50 text-blue-600" :
                project.type === 'RS' ? "bg-purple-50 text-purple-600" :
                "bg-orange-50 text-orange-600"
              )}>
                {project.type}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#00529B] transition-colors">{project.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} />
                    Modified {project.lastModified}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    project.status === 'Drafting' ? "bg-yellow-100 text-yellow-700" :
                    project.status === 'Review' ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              {project.complianceScore !== undefined && (
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Compliance</p>
                  <p className={cn(
                    "text-lg font-bold",
                    project.complianceScore >= 80 ? "text-green-600" : "text-yellow-600"
                  )}>{project.complianceScore}%</p>
                </div>
              )}
              <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-3 min-w-[140px]">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DraftingTool({ form, setForm, onSubmit, isGenerating }: { form: any, setForm: any, onSubmit: () => void, isGenerating: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">New Procurement Draft</h2>
        <p className="text-slate-500">AI-assisted drafting aligned with NLB and Government standards.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Project Title</label>
            <input 
              type="text" 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Supply of Library Shelving"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00529B] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Document Type</label>
            <select 
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ProcurementType })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00529B] focus:outline-none"
            >
              <option value="AOR">Approval of Requirements (AOR)</option>
              <option value="RS">Requirement Specifications (RS)</option>
              <option value="ER">Evaluation Report (ER)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Project Description</label>
          <textarea 
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe the procurement objective..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00529B] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Key Requirements / Scope</label>
          <textarea 
            rows={5}
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="List technical specs, quantities, delivery timelines..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00529B] focus:outline-none"
          />
        </div>

        <button 
          onClick={onSubmit}
          disabled={isGenerating || !form.title}
          className="w-full py-3 bg-[#00529B] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00427A] transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Generating Draft...
            </>
          ) : (
            <>
              <Send size={20} />
              Generate AI Draft
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function ProjectDetail({ project, onBack, onReview, isReviewing, reviewResult }: { project: ProcurementProject, onBack: () => void, onReview: () => void, isReviewing: boolean, reviewResult: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
            <Download size={16} />
            Export PDF
          </button>
          <button 
            onClick={onReview}
            disabled={isReviewing}
            className="px-4 py-2 bg-[#00529B] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#00427A]"
          >
            {isReviewing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Run Compliance Check
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[600px]">
          <div className="prose prose-slate max-w-none">
            <Markdown>{project.content || "_No content generated yet. Use the Drafting tool to create a draft._"}</Markdown>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Project Info</h3>
            <div className="space-y-4">
              <InfoRow label="Type" value={project.type} />
              <InfoRow label="Status" value={project.status} />
              <InfoRow label="Last Modified" value={project.lastModified} />
            </div>
          </div>

          {(reviewResult || project.complianceIssues) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Compliance Report</h3>
                <span className={cn(
                  "text-xl font-bold",
                  (reviewResult?.score ?? project.complianceScore ?? 0) >= 80 ? "text-green-600" : "text-yellow-600"
                )}>{reviewResult?.score ?? project.complianceScore}%</span>
              </div>
              
              <div className="space-y-3">
                {(reviewResult?.issues ?? project.complianceIssues ?? []).map((issue: ComplianceIssue, idx: number) => (
                  <div key={idx} className={cn(
                    "p-3 rounded-lg border text-xs",
                    issue.severity === 'high' ? "bg-red-50 border-red-100 text-red-800" :
                    issue.severity === 'medium' ? "bg-yellow-50 border-yellow-100 text-yellow-800" :
                    "bg-blue-50 border-blue-100 text-blue-800"
                  )}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {issue.severity === 'high' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                      {issue.severity.toUpperCase()} PRIORITY
                    </div>
                    <p className="font-medium">{issue.message}</p>
                    <p className="mt-1 opacity-80">Suggestion: {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReviewTool({ projects, onReview, isReviewing }: { projects: ProcurementProject[], onReview: (p: ProcurementProject) => void, isReviewing: boolean, reviewResult: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Compliance Audit Dashboard</h2>
        <p className="text-slate-500">Monitor and manage the compliance status of all NLB procurement documents.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document Title</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compliance Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.filter(p => p.content).map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{project.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{project.type}</td>
                <td className="px-6 py-4">
                  {project.complianceScore !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            project.complianceScore >= 80 ? "bg-green-500" : "bg-yellow-500"
                          )} 
                          style={{ width: `${project.complianceScore}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-bold",
                        project.complianceScore >= 80 ? "text-green-600" : "text-yellow-600"
                      )}>{project.complianceScore}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Reviewed</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    project.status === 'Drafting' ? "bg-yellow-100 text-yellow-700" :
                    project.status === 'Review' ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onReview(project)}
                    disabled={isReviewing}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isReviewing ? "Reviewing..." : project.complianceScore !== undefined ? "Re-audit" : "Run Audit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
