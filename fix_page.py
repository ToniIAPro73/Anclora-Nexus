import re

path = r'C:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\frontend\src\app\(dashboard)\leads\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    "import LeadFormModal from '@/components/modals/LeadFormModal'",
    "import LeadFormModal from '@/components/modals/LeadFormModal'\nimport SourceBadge from '@/components/ui/SourceBadge'\nimport { Filter } from 'lucide-react'"
)

# 2. Add filter states and logic
old_logic = """  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE)
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginatedLeads = leads.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)"""

new_logic = """  const [currentPage, setCurrentPage] = useState(1)
  const [filterOrigin, setFilterOrigin] = useState<string>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')

  const filteredLeads = leads.filter(lead => {
    const matchOrigin = filterOrigin === 'all' || lead.source_system === filterOrigin
    const matchChannel = filterChannel === 'all' || lead.source_channel === filterChannel
    return matchOrigin && matchChannel
  })

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginatedLeads = filteredLeads.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)"""

content = content.replace(old_logic, new_logic)

# 3. Add filter UI
filter_ui = """        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-navy-surface/20 border border-soft-subtle/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-soft-muted">{t('filterByOrigin')}:</span>
          </div>
          <select 
            value={filterOrigin}
            onChange={(e) => {
              setFilterOrigin(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-navy-deep/50 border border-soft-subtle/50 rounded-lg px-3 py-1.5 text-sm text-soft-white focus:border-gold/50 outline-none transition-all"
          >
            <option value="all">{t('allOrigins')}</option>
            <option value="manual">{t('sourceManual')}</option>
            <option value="cta_web">{t('sourceCtaWeb')}</option>
            <option value="social">{t('sourceSocial')}</option>
            <option value="referral">{t('sourceReferral')}</option>
            <option value="partner">{t('sourcePartner')}</option>
          </select>

          <div className="h-6 w-px bg-soft-subtle/30" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-soft-muted">{t('filterByChannel')}:</span>
          </div>
          <select 
            value={filterChannel}
            onChange={(e) => {
              setFilterChannel(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-navy-deep/50 border border-soft-subtle/50 rounded-lg px-3 py-1.5 text-sm text-soft-white focus:border-gold/50 outline-none transition-all"
          >
            <option value="all">{t('allChannels')}</option>
            <option value="website">{t('sourceWebsite')}</option>
            <option value="linkedin">{t('sourceLinkedin')}</option>
            <option value="instagram">{t('sourceInstagram')}</option>
            <option value="facebook">{t('sourceFacebook')}</option>
            <option value="email">{t('sourceEmail')}</option>
            <option value="phone">{t('sourcePhone')}</option>
          </select>

          {(filterOrigin !== 'all' || filterChannel !== 'all') && (
            <button
              onClick={() => {
                setFilterOrigin('all')
                setFilterChannel('all')
                setCurrentPage(1)
              }}
              className="text-xs text-blue-light hover:text-white transition-colors underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          )}
        </div>"""

content = content.replace(
    "          </div>\n        </div>\n\n        {/* Table */}",
    "          </div>\n        </div>\n\n" + filter_ui + "\n\n        {/* Table */}"
)

# 4. Use filteredLeads for empty check
content = content.replace(
    "{leads.length === 0 ?",
    "{filteredLeads.length === 0 ?"
)

# 5. Use SourceBadge in column
content = content.replace(
    """                        <td className="px-3 py-4">
                          <span className="text-xs uppercase tracking-wider text-soft-muted font-medium">
                            {lead.source}
                          </span>
                        </td>""",
    """                        <td className="px-3 py-4">
                          <SourceBadge lead={lead} />
                        </td>"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
