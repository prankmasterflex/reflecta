import './globals.css'
import { PHProvider } from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <PHProvider>
                    {children}
                </PHProvider>
            </body>
        </html>
    )
}
