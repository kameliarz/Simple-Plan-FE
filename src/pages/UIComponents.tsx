import { useState } from 'react'
import { IconFolderOff } from '@tabler/icons-react'

import Search from '@/components/ui/Search'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Dropdown from '@/components/ui/Dropdown'
import DateInput from '@/components/ui/DateInput'


export default function UIComponents() {

  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState('Semua status')

  const [date, setDate] = useState('')


  const meta = {
    current_page: page,
    last_page: 5,
    from: (page - 1) * 10 + 1,
    to: page * 10,
    total: 48,
    per_page: 10,
    path: '',
  }


  const tickets = [
    {
      nomor: '#TK-2023-001',
      pelapor: 'Dr. Andi Santoso',
      unit: 'IGD',
      tanggal: '24 Okt 2023, 08:30',
      status: 'Baru',
    },

    {
      nomor: '#TK-2023-002',
      pelapor: 'Ns. Siti Rahma',
      unit: 'Radiologi',
      tanggal: '24 Okt 2023, 09:15',
      status: 'Terverifikasi',
    },

    {
      nomor: '#TK-2023-003',
      pelapor: 'Budi Santoso',
      unit: 'Poli Umum',
      tanggal: '25 Okt 2023, 10:30',
      status: 'Diproses',
    },

    {
      nomor: '#TK-2023-004',
      pelapor: 'Siti Rahma',
      unit: 'IGD',
      tanggal: '26 Okt 2023, 11:00',
      status: 'Selesai',
    },

    {
      nomor: '#TK-2023-005',
      pelapor: 'Ahmad Fauzi',
      unit: 'Laboratorium',
      tanggal: '27 Okt 2023, 13:20',
      status: 'Ditolak',
    },
  ]


  const filteredTickets = tickets.filter((ticket) => {

    const keyword = search.toLowerCase()


    return (
      ticket.nomor
        .toLowerCase()
        .includes(keyword) ||

      ticket.pelapor
        .toLowerCase()
        .includes(keyword) ||

      ticket.unit
        .toLowerCase()
        .includes(keyword) ||

      ticket.status
        .toLowerCase()
        .includes(keyword)
    )

  })


  return (

    <div className="space-y-8 bg-background p-8">


      {/* FILTER */}

      <section className="flex items-center gap-4">

        <Dropdown
          value={status}
          onChange={setStatus}
          options={[
            'Semua status',
            'Baru',
            'Terverifikasi',
            'Diproses',
            'Selesai',
            'Ditolak',
          ]}
        />


        <DateInput
          value={date}
          onChange={setDate}
        />

      </section>



      {/* SEARCH */}

      <section>

        <h2 className="mb-3">
          Search
        </h2>


        <Search
          value={search}
          onChange={setSearch}
          placeholder="Cari tiket..."
        />

      </section>




      {/* TABLE */}

      <section>

        <h2 className="mb-4">
          Table
        </h2>


        <div
          className="
            overflow-hidden
            rounded-lg
            border
            border-slate-200
            bg-white
          "
        >


          <Table>


            <Table.Thead>

              <tr>

                <Table.Th>
                  Nomor Tiket
                </Table.Th>


                <Table.Th>
                  Pelapor
                </Table.Th>


                <Table.Th>
                  Unit
                </Table.Th>


                <Table.Th>
                  Tanggal Dibuat
                </Table.Th>


                <Table.Th>
                  Status
                </Table.Th>


              </tr>

            </Table.Thead>



            <Table.Tbody>


              {
                filteredTickets.length === 0 ? (

                  <Table.Empty
                    colSpan={5}
                    message="Tiket Tidak Ditemukan"
                    description={
                      search
                        ? `Pencarian untuk "${search}" tidak membuahkan hasil.`
                        : 'Belum ada data tiket.'
                    }
                  >

                    <div
                      className="
                        flex
                        h-15
                        w-15
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                      "
                    >

                      <IconFolderOff
                        size={40}
                        strokeWidth={1.5}
                        className="text-slate-400"
                      />

                    </div>


                  </Table.Empty>


                ) : (


                  filteredTickets.map((ticket) => (

                    <tr key={ticket.nomor}>


                      <Table.Td>
                        {ticket.nomor}
                      </Table.Td>


                      <Table.Td>
                        {ticket.pelapor}
                      </Table.Td>


                      <Table.Td>
                        {ticket.unit}
                      </Table.Td>


                      <Table.Td>
                        {ticket.tanggal}
                      </Table.Td>



                      <Table.Td>

                        <span
                          className="
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-xs
                            font-medium
                            text-blue-700
                          "
                        >

                          {ticket.status}

                        </span>

                      </Table.Td>


                    </tr>

                  ))

                )
              }


            </Table.Tbody>


          </Table>



          {/* PAGINATION */}

          <div
            className="
              border-t
              border-slate-200
              bg-white
              px-6
              py-3
            "
          >

            <Pagination
              meta={meta}
              onPageChange={setPage}
            />

          </div>


        </div>


      </section>
      </div>
  )
}