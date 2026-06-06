import styles from './GeorgeSurfaceFix.module.css'

export default function GeorgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={styles.georgeSurfaceFixScope}>{children}</div>
}
