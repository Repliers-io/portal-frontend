import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Breadcrumbs, Link } from '@mui/material'

import routes from '@configs/routes'

import { useProperty } from 'providers/PropertyProvider'
import { notNA } from 'utils/strings'

const NavigationBreadcrumbs = () => {
  const {
    property: {
      address: { neighborhood, area, city }
    }
  } = useProperty()

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ fontSize: 14, '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
    >
      <Link key="1" underline="hover" color="inherit" href={routes.map}>
        For sale
      </Link>
      {notNA(area) && area !== city && (
        <Link
          key="4"
          underline="hover"
          color="inherit"
          href={`${routes.area}/?q=${area}`}
        >
          {area}
        </Link>
      )}
      <Link
        key="3"
        underline="hover"
        color="inherit"
        href={`${routes.area}/?q=${city}`}
      >
        {city}
      </Link>
      {notNA(neighborhood) && (
        <Link
          key="5"
          underline="hover"
          color="inherit"
          href={`${routes.area}/?q=${neighborhood}, ${city}`}
        >
          {neighborhood}
        </Link>
      )}
    </Breadcrumbs>
  )
}

export default NavigationBreadcrumbs
