import logo from '../assets/aira-logo.png'

// The source file has a solid-white background around the mark itself;
// multiply-blending it removes that white box against the page's off-white
// background instead of showing a visible rectangle.
export default function Logo() {
  return (
    <div className="fixed left-6 top-6 md:left-8 md:top-8">
      <img src={logo} alt="Aira" className="h-10 w-auto mix-blend-multiply" />
    </div>
  )
}
